# Creating automated web applications tests for MUTE

With the high complexity of the code, each addition to the code might add a bug that may not be perceivable.
As we aim to modify, evolve mute and add features in the future, we need to have a testing suite to guarantee the non-regression of MUTE's core functionalities.

## Choosing an automated test suite solution

### What should be the core features of the testing suite solution ?
From a wide perspective, the testing suite should fulfill these conditions :
- Fairly easy to understand and use
- Strongly supported by the community : documented and maintained
- Specific features : 
    - Being able to open multiple tabs in a browser at once
    - Being compatible with much of the main browsers on the market
    - Allowing users to write tests in Typescript
    - Being usable in a container environment (Docker, Github actions) 
- *Bonus features :*
    - Being easily scalable to test browsers as if we were on different devices (tablet, smartphone...)

### Main scenario of the POC

To test the capabilities of the automated test suite that will be used in this poc, we have a scenario that should cover our needs.
If the automated test suite can easily flow through the steps, it means that it can be a suitable option as a test suite for MUTE.

The test suite will be tested on [this version](https://github.com/BaptisteHubert/mute/releases/tag/0.12.3) of MUTE. Tests will run on an instance of mute running locally)

These are the main steps that the automated test suite should verify:

1. A browser tab is launched, with the url of mute.
2. A document is opened. 
    - An editor is accessible, with various 
    - The signaling server is accessible after a second
3. Text is written on the document
4. Another browser tab is launched, with the url of the previous document.
    - The document is opened.
    - The signaling server is accessible after a second 
        - Text in the editor should be the exact same as the text written in the previous step.
5. The signaling server is killed off
6. Browser tab 1 adds text to the document. Browser tab 2 adds text to the document
7. Text is merged and appears the same in the browser tabs

### End-To-End web application testing solutions

- [Testcafe.io](https://testcafe.io/) - **The solution that we will be using**
    - Typescript support for writing tests
    - TestCafe tests are Node.js scripts.
    - Relatively complete documentation, with [example repository](https://github.com/DevExpress/testcafe-examples) available
    - Browser Sandboxing - Deletes all browser cookies (*useful as it will ensure each run to be a clean run, devoid of noise from previous runs*)
    - Distributed for free under the MIT license
- [Selenium](https://www.selenium.dev/) 
    - No native support for TypeScript as of 29/09/2022 but a [@types/selenium-webdriver](https://www.npmjs.com/package/@types/selenium-webdriver) exists.
    - Support for multiple tabs and multiple browsers
    - Distributed for free under the Apache 2.0 license
- [Appium](https://appium.io/)
    - Mainly used for native, mobile web and hybrid mobile apps
    - Server written in Node.js
    - Supports android, IOS apps but also Windows apps.
- [Cypress](https://docs.cypress.io/guides/overview/why-cypress)
    - no multi tabs support - [source](https://docs.cypress.io/guides/references/trade-offs#Multiple-browsers-open-at-the-same-time)

From this list, we will make this POC with TestCafe.

##  Results of automated test suite solution

### TestCafe 

1. A browser tab is launched, with the url of mute.
2. A document is opened. 
    - An editor is accessible, with various 
    - The signaling server is accessible after a second
3. Text is written on the document
4. Another browser tab is launched, with the url of the previous document.
    - The document is opened.
    - The signaling server is accessible after a second 
        - Text in the editor should be the exact same as the text written in the previous step.
5. The signaling server is killed off
6. Browser tab 1 adds text to the document. Browser tab 2 adds text to the document
7. Text is merged and appears the same in the browser tabs