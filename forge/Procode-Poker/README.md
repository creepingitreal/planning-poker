# Forge Learning Example

This folder contains a Forge example app that is being kept as part of a first learning session. It is currently reference material, not a completed integration with the main planning poker app.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for Forge documentation and tutorials.

## Current Intent

- Use this app to learn the Forge project structure.
- Treat the existing implementation as example code.
- Expect the app name, behaviour, and modules to change during later sessions.

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick Start

- Install top-level dependencies:
```
npm install
```

- Install dependencies inside of the `static/procode-deploy` directory:
```
npm install
```

- Explore or modify the app by editing the files in `static/procode-deploy/src/`.

- Build your app (inside of the `static/procode-deploy` directory):
```
npm run build
```

- Deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

### Notes

- This is a learning sandbox, so validate changes in a safe development environment.
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
