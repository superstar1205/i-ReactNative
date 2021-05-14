import { GluegunToolbox } from "../types"
import { spawnProgress } from "../tools/spawn"
import { isAndroidInstalled } from "../tools/react-native"
import { packager } from "../tools/packager"
import {
  command,
  direction,
  heading,
  igniteHeading,
  p,
  startSpinner,
  stopSpinner,
} from "../tools/pretty"

const isWindows = process.platform === "win32"

export default {
  run: async (toolbox: GluegunToolbox) => {
    const { print, filesystem, system, meta, parameters, strings } = toolbox
    const { kebabCase } = strings
    const { exists, path, remove } = filesystem
    const { info, colors } = print
    const { gray, red, magenta, cyan, yellow } = colors

    // start tracking performance
    const perfStart = new Date().getTime()

    // retrieve project name from toolbox
    const { validateProjectName } = require("../tools/validations")
    const projectName = validateProjectName(toolbox)
    const projectNameKebab = kebabCase(projectName)

    // if they pass in --overwrite, remove existing directory otherwise throw if exists
    if (parameters.options.overwrite) {
      remove(projectName)
    } else if (exists(projectName)) {
      p()
      p(
        yellow(
          `Error: There's already a folder with the name "Foo". To force overwriting that folder, run with --overwrite.`,
        ),
      )
      process.exit(1)
    }

    // if they pass in --boilerplate, warn them to use old Ignite
    const bname = parameters.options.b || parameters.options.boilerplate
    if (bname) {
      p()
      p(yellow(`Different boilerplates are no longer supported in Ignite v4+.`))
      p(gray(`To use the old CLI to support different boilerplates, try:`))
      p(cyan(`npx ignite-cli@3 new ${projectName} --boilerplate ${bname}`))
      process.exit(1)
    }

    // debug?
    const debug = Boolean(parameters.options.debug)
    const log = (m) => {
      if (debug) info(m)
      return m
    }

    // expo or no?
    const expo = Boolean(parameters.options.expo)
    const cli = expo ? "expo-cli" : "react-native-cli"
    const ignitePath = path(`${meta.src}`, "..")
    const boilerplatePath = path(ignitePath, "boilerplate")
    const cliEnv = expo && debug ? { ...process.env, EXPO_DEBUG: 1 } : process.env
    const cliString = expo
      ? `npx expo-cli init ${projectName} --template ${boilerplatePath} --non-interactive`
      : `npx react-native init ${projectName} --template ${
          !isWindows ? "file://" : ""
        }${ignitePath}${debug ? " --verbose" : ""}`

    log({ expo, cli, ignitePath, boilerplatePath, cliString })

    // welcome everybody!
    p("\n")
    igniteHeading()
    p(` █ Creating ${magenta(projectName)} using ${red("Ignite")} ${meta.version()}`)
    p(` █ Powered by ${red("Infinite Red")} - https://infinite.red`)
    p(` █ Using ${cyan(cli)}`)
    p(` ────────────────────────────────────────────────\n`)

    startSpinner("Igniting app")

    // generate the project
    await spawnProgress(log(cliString), {
      env: cliEnv,
      onProgress: (out: string) => {
        out = log(out.toString())

        stopSpinner("Igniting app", "🔥")

        if (expo) {
          if (out.includes("Using Yarn")) {
            startSpinner("Summoning Expo CLI")
          }
          if (out.includes("project is ready")) {
            stopSpinner("Summoning Expo CLI", "🪔")
            startSpinner("Cleaning up Expo install")
          }
        } else {
          if (out.includes("Welcome to React Native!")) {
            startSpinner(" 3D-printing a new React Native app")
          }
          if (out.includes("Run instructions for")) {
            stopSpinner(" 3D-printing a new React Native app", "🖨")
            startSpinner("Cooling print nozzles")
          }
        }
      },
    })

    if (expo) {
      stopSpinner("Summoning Expo CLI", "🪔")
      stopSpinner("Cleaning up Expo install", "🎫")
    } else {
      stopSpinner(" 3D-printing a new React Native app", "🖨")
      stopSpinner("Cooling print nozzles", "🧊")
    }

    // note the original directory
    const cwd = log(process.cwd())

    // jump into the project to do additional tasks
    process.chdir(projectName)

    // copy the .gitignore if it wasn't copied over [expo...]
    // Release Ignite installs have the boilerplate's .gitignore in .npmignore
    // (see https://github.com/npm/npm/issues/3763); development Ignite still
    // has it in .gitignore. Copy it from one or the other.
    const targetIgnorePath = log(path(process.cwd(), ".gitignore"))
    if (!filesystem.exists(targetIgnorePath)) {
      let sourceIgnorePath = log(path(boilerplatePath, ".npmignore"))
      if (!filesystem.exists(sourceIgnorePath)) {
        sourceIgnorePath = path(boilerplatePath, ".gitignore")
      }
      filesystem.copy(sourceIgnorePath, targetIgnorePath)
    }

    // Update package.json:
    // - We need to replace the app name in the detox paths. We do it on the
    //   unparsed file content since that's easier than updating individual values
    //   in the parsed structure, then we parse that as JSON.
    // - Having a "prepare" script in package.json messes up expo-cli init above
    //   (it fails because npm-run-all hasn't been installed yet), so we
    //   add it.
    // - If Expo, we also merge in our extra expo stuff.
    // - Then write it back out.
    let packageJsonRaw = filesystem.read("package.json")
    packageJsonRaw = packageJsonRaw
      .replace(/HelloWorld/g, projectName)
      .replace(/hello-world/g, projectNameKebab)
    let packageJson = JSON.parse(packageJsonRaw)

    if (expo) {
      const merge = require("deepmerge-json")
      const expoJson = filesystem.read("package.expo.json", "json")
      packageJson = merge(packageJson, expoJson)
    }

    filesystem.write("package.json", packageJson)

    // More Expo-specific changes
    if (expo) {
      // remove the ios and android folders
      filesystem.remove("./ios")
      filesystem.remove("./android")

      // rename the index.js to App.js, which expo expects;
      // update the reference to it in tsconfig, too
      filesystem.rename("./index.js", "App.js")
      await toolbox.patching.update("tsconfig.json", (config) => {
        config.include[0] = "App.js"
        return config
      })

      // use Detox Expo reload file
      filesystem.remove("./e2e/reload.js")
      filesystem.rename("./e2e/reload.expo.js", "reload.js")

      // use Expo AsyncStorage file
      filesystem.remove("./app/utils/storage/async-storage.ts")
      filesystem.rename("./app/utils/storage/async-storage.expo.ts", "async-storage.ts")

      startSpinner("Unboxing NPM dependencies")
      await packager.install({ onProgress: log })
      stopSpinner("Unboxing NPM dependencies", "🧶")

      // for some reason we need to do this, or we get an error about duplicate RNCSafeAreaProviders
      // see https://github.com/th3rdwave/react-native-safe-area-context/issues/110#issuecomment-668864576
      await packager.add("react-native-safe-area-context", { expo: true })
    } else {
      // remove the Expo-specific files -- not needed
      filesystem.remove(`./bin/downloadExpoApp.sh`)
      filesystem.remove("./e2e/reload.expo.js")
      filesystem.remove("./app/utils/storage/async-storage.expo.ts")

      // install pods
      startSpinner("Baking CocoaPods")
      await spawnProgress("npx pod-install", {})
      stopSpinner("Baking CocoaPods", "☕️")
    }

    // remove the expo-only package.json
    filesystem.remove("package.expo.json")

    // Make sure all our modifications are formatted nicely
    const npmOrYarnRun = packager.is("yarn") ? "yarn" : "npm run"
    await spawnProgress(`${npmOrYarnRun} format`, {})

    // commit any changes
    if (parameters.options.git !== false) {
      startSpinner(" Backing everything up in source control")
      await system.run(
        log(`
          \\rm -rf ./.git
          git init;
          git add -A;
          git commit -m "New Ignite ${meta.version()} app";
        `),
      )
      stopSpinner(" Backing everything up in source control", "🗄")
    }

    // back to the original directory
    process.chdir(log(cwd))

    // we're done! round performance stats to .xx digits
    const perfDuration = Math.round((new Date().getTime() - perfStart) / 10) / 100

    p()
    p()
    heading(`${red("Ignite CLI")} ignited ${yellow(projectName)} in ${gray(`${perfDuration}s`)}`)
    p()
    direction(`To get started:`)
    command(`  cd ${projectName}`)
    if (expo) {
      command(`  ${npmOrYarnRun} start`)
    } else {
      if (process.platform === "darwin") {
        command(`  npx react-native run-ios`)
      }
      command(`  npx react-native run-android`)
      if (isAndroidInstalled(toolbox)) {
        p()
        direction("To run in Android, make sure you've followed the latest react-native setup")
        direction(
          "instructions at https://facebook.github.io/react-native/docs/getting-started.html",
        )
        direction(
          "before using ignite. You won't be able to run Android successfully until you have.",
        )
      }
    }
    p()
    p("Need additional help?")
    p()
    direction("Join our Slack community at http://community.infinite.red.")
    p()
    heading("Now get cooking! 🍽")
    igniteHeading()
  },
}
