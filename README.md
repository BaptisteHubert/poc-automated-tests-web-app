# poc-automated-tests-web-app

This repository aims to show the usage of an automated web app testing suite.
It will also implement automated actions.

# The Web-app

run this command in the `web-app/` folder
> docker-compose up -d 


## Where is the full code of MUTE
The web-app folder contains only the necessary files for MUTE to run locally on your computer, to make the repository as light as possible.
The folder consists of the build of this [release code](https://github.com/BaptisteHubert/mute/releases/tag/0.12.3) with a slight modification.

In the `src/environment/environment.prod.ts` file (*line 6 to 17*):

```
const host = 'localhost' // FIXME: interpolation at build time required

export const environment: IEnvironment = {
  ...defaultEnvironment, // we extend the default environment

  production: true,

  p2p: {
    // Signaling server URL
    // See https://github.com/coast-team/sigver
    signalingServer: `ws://${host}:8011`,
  },
```

instead of 

```
const host = 'mutehost.loria.fr' // FIXME: interpolation at build time required

export const environment: IEnvironment = {
  ...defaultEnvironment, // we extend the default environment

  production: true,

  p2p: {
    // Signaling server URL
    // See https://github.com/coast-team/sigver
    signalingServer: `wss://${host}:8010`,
  },
```



