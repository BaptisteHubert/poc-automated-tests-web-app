# Creating automated web applications tests for MUTE

With the high complexity of the code, each addition to the code might add a bug that may not be perceivable.
As we aim to modify, evolve mute and add features in the future, we need to have a testing suite to guarantee the non-regression of MUTE's core functionalities.

## **Choosing an automated test suite solution**

### **What should be the core features of the testing suite solution ?**
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

### **Main scenario of the POC**

To test the capabilities of the automated test suite that will be used in this poc, we have a scenario that should cover our needs.
If the automated test suite can easily flow through the steps, it means that it can be a suitable option as a test suite for MUTE.

The test suite will be tested on [this version](https://github.com/BaptisteHubert/mute/releases/tag/0.12.3) of MUTE. Tests will run on an instance of mute running locally)

These are the main steps that the automated test suite should verify:

1. A browser tab is launched, with the URL of Mute.
2. A document is opened. 
    - An editor is accessible 
    - The signaling server is accessible after a few seconds
3. Text is written on the document
4. Another browser tab is launched, with the URL of the previous document.
    - The document is opened.
    - The signaling server is accessible after a second 
    - There should be two user on the document
    - Text in the editor should be the exact same as the text written in the previous step.
5. The signaling server is killed off
    - There should still be two user on the document
    - Each user can add text to the doc and modification is visible from the other tab
        - User 1 adds some text to the editor. Text added is seen in User 2 tab
        - User 2 adds some text to the editor. Text added is seen in User 1 tab
6. Testing the offline mode
    - Browser tab 1 leave the document and then re-join it. The modification bound to this tab should still be visible in the document
    - Browser tab 2 leave the document and then re-join it. The modification bound to this tab should still be visible in the document 
7. The signaling server is rebooted
    - The signaling server is accessible after a few seconds
    - Text is merged and appears the same in the two browser tabs

#### **Additional scenario**

*Ui specific*
- Two users connect on the same document
- In the first tab, the username is changed to User1
- In the second tab, the username is changed to User2
- In the users list in each tab, name should be correct


### **End-To-End web application testing solutions**

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


## **Specificity of MUTE for testing**

### **Where to click to have the focus on the editor :**
How are the lines presented :
Lines added are in a block with the CodeMirror-lines class.
In this object, there is a div containing a CodeMirror-code class.
In the CodeMirror-code, there are all the lines on the document

Here is the full route 
```
html
--body
----mute-root 
------mute-doc
--------mat-sidenav-content
----------mat-drawer-container
------------mat-drawer-content
--------------mute-editor 
----------------mat-card
------------------div mat-card mat-focus-indicator card-lt-sm
--------------------div tui-editor-defaultUI
----------------------div te-toolbar-section
------------------------div tui-editor te-md-mode
--------------------------div te-md-container te-preview-style-tab
----------------------------div te-editor te-tab-active
------------------------------div CodeMirror cm-s-default CodeMirror-wrap 
```

The text written is available at the previous route, with this additional route
```
div CodeMirror-scroll
--div CodeMirror-sizer 
----div
------div
--------CodeMirror-lines
----------div
------------div CoveMirror-code
```


In code mirror editor, here are the lines as typed :

```
Hello,

How are you

Have a good day
```

In the editor side, we will have 6 lines in the CodeMirror-lines class, 
```
<pre class=" CodeMirror-line " role="presentation">
    <span role="presentation">Hello,</span>
</pre>
<pre class=" CodeMirror-line " role="presentation">
    <span role="presentation"></span>
</pre>
<pre class=" CodeMirror-line " role="presentation">
    <span role="presentation">How are you</span>
</pre>
<pre class=" CodeMirror-line " role="presentation">
    <span role="presentation"></span>
</pre>
<pre class=" CodeMirror-line " role="presentation">
    <span role="presentation">Have a good day</span>
</pre>
```

Additionally, the text written in the editor is available (*without accounting newlines*) under a div with the class `tui-editor-contents`.

##  **Results of automated test suite solution**

### **TestCafe**

#### **Technical choices**

*Comparing what's written in the editor with an expected text*  
We faced issues when doing this because invisible characters (*u200B control characters*) made the above assertion impossible to pass.
As a solution, we were helped both by [this comment](https://stackoverflow.com/a/51602415), as it helped us format the text written in the edito to remove control characters, but we were still facing issues with newline and spaces making comparing string impossible. With this comment, we knew that normalizing the text was necessary.  
We found a solution in [this answer](https://stackoverflow.com/a/71459391), as we used this code in our `tools.normalizeTextForEql` and subsequent `tools.normalizeNewlineAndSpace` function.

Another problem that we faced during the POC, is that when two users are on the same document, the other user name is written in the editor `innertext`. We found out that, when another user is on the document, at the place where he is, a span with class `CodeMirror-widget` is there to give information about the current other user.

Some way of going through this :
- Waiting for the cursor to disappear - ```await new Promise(resolve => setTimeout(resolve, 10000));``` - KO
- Removing " Anonymous" from the string - Not clean enough and not adaptable to most use cases- KO
- Getting the lines written, and check if a `<span>` with the aforementioned class is in the line - A bit of code but should globally work - OK
    - We go through the child of the `CodeMirror-line` element. Normally (*when there are no visible cursor in the editor*), there should only be a span containing the text of the line. When the span with the class `CodeMirror-widget` appears, it appears as a child of the span mentioned before. In the code, we are going through the line, and verifying if there are child elements where there shouldn't be (the child of the child of the `CodeMirror-line` element)
    - We found a way to get the HTMl value of the elements in a `CodeMirror-line` using the code provided in the first example, for TypeScript, in [the documentation](https://testcafe.io/documentation/402759/reference/test-api/selector/addcustomdomproperties) from TestCafe.
    - We used the regex provided in [this answer](https://stackoverflow.com/a/226591) and adapted it to our needs
    - We are then removing the excess in the HTML to get the clean text value of the line.

*Collaborating on a document, and then killing the signaling server*  
We faced some problems as we were trying to test the process when two users join the same document.  
The problem comes from the fact that we were launching each tab on the same browser (*chrome*). Subsequently, error due to the use of the localstorage by MUTE made the testing impossible. By example, when we killed the signaling server, user could write on the document but the text he wrote would be truncated on the other tab. 

We have found a way to simulate two different users working on the same document by simulating a pause when need during two concurrents tests run. Indeed, we do not need to have two users running concurrently and syncing the tests. That would be too much time spent on tuning the tests. That was wat was intended at first as a sort of quick fix but with this logic, we can sync tests much more easily, and also keep track of where we are in the tests progress.

Basically, as there are two tests file, both sharing some variables, we created a common variable file. In this file, we have added two booleans.
- `executingTestUser1` set at `true` because the first test to run will be the test of the main user, the user 1.
- `executingTestUser2` set at `false` as we will wait for actions to be done on the doc by the user 1 before simulating actions from user 2.

Those variables can be retrieved via getters. They do not have a setter as we do not need to have both tests really running concurrently. The setter basically make the current `true` value at `false`, and the `false` value to `true`, switching which user is active. This function is called `stopExecAndResumeOther`

To "stop" a test, we added  this code :
```
while (mainScenarioVariables.getExecutingTestUser2() != true){
        await t.wait(1000)
}
```

During this time, the user 1 execute is code. When he has done what he need to do, he calls the `stopExecAndResumeOther` function and then we add this code to "stop" his code from executing :
```
while (mainScenarioVariables.getExecutingTestUser1() != true){
        await t.wait(1000)
}
```


#### **Adapting the main scenario to TestCafe and two users**
*Next to the steps, we will mark U1 or U2 (representing User 1 and User2) as which user is active at that time*
1. A browser tab is launched, with the URL of Mute. - **(U1)**
2. A document is opened. - **(U1)**
    - a. The editor is accessible - **(U1)**
    - b. The signaling server is accessible after a few seconds - **(U1)**
3. Text is written on the document - **(U1)**
    - a. The text written in the document is displayed as intended - **(U1)**
4. Another browser tab is launched, with the URL of the previous document. 
    - **Switch to User 2**
    - a. The document is opened - **(U2)**
    - b. The signaling server is accessible after a few seconds - **(U2)**
    - c. There should be two user on the document - **(U2)**
    - d. Text in the editor should be the exact same as the text written in the previous step by User 1 - **(U2)**
    - e. The editor is accessible by User 2  - **(U2)**
    - **Switch to User 1**
    - f. There should be two user on the document - **(U1)**
    - g. The second user has added some text to the document - **(U1)**
        *- The first user removes what the second user added* - **(U1)**
        - **Switch to User 2**
    
    - h. The text is back to normal (User 1 removed what was added by User 2) - **(U2)**

5. The signaling server is killed off - **(U2)**
    - a. The signaling server is unatteignable - **(U2)**
    - b. There should still be two user on the document - **(U2) & (U1)** 
    - c. Each user can add text to the doc and modification is visible from the other tab - **(U2) & (U1)**
        - c.1 User 2 adds some text to the editor. - **(U2)**
            - *Verify that text was added in the editor* - **(U2)**
            - **Switch to User 1**
        - c.2 Text added by User 2 is seen in User 1 tab - **(U1)**
            - User 1 remove what User 2 added to the editor - **(U1)**
            - User 1 adds some text to the editor - **(U1)**
            - *Verify that text was added in the editor* - **(U1)**
            - **Switch to User 2**
        - c.3 Text added by User 1 is seen in User 2 tab - **(U2)**
            - User 2 remove what User 1 added to the editor - **(U2)**
6. Testing the offline mode **(U2) && (U1)**
    - a. Browser tab 2 leave the document and then re-join it - **(U2)**
        - a.1. User 2 is alone as he left the document and re-joined it while the signaling server was off - **(U2)**
        - a.2. The modification bound to the user 2 tab should still be visible in the document - **(U2)**
        - **Switch to User 1**
    - b. Browser tab 1 leave the document and then re-join it - **(U1)**
        - b.1. User 1 is alone as he left the document and re-joined it while the signaling server was off - **(U1)**
        - b.2. The modification bound to the user 1 tab should still be visible in the document - **(U1)**
7. The signaling server is rebooted - **(U1)**
    - a. The signaling server is accessible after a few seconds - **(U1)**
    - b. Text is merged and appears the same in the two browser tabs - **(U1) & (U2)**