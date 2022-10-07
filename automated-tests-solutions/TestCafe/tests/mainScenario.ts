import { Selector, userVariables } from 'testcafe';
import { tools } from '../tools';

fixture`Main Scenario`.page`http://localhost:4200`

let tool = new tools()

//The expected text that should be written in the CodeMirror editor
let expectedText = 
`Hello, i am the first user

Have a nice day  `

let urlSignaling = 'ws://localhost:8011'

test('My first test', async t => {
    
    console.log("--Testing the main scenario--")

    // 1. A browser tab is launched, with the url of mute.
    await t.
        navigateTo('http://localhost:4200/urlDoc')

    //2. A document is opened. 
    // - An editor is accessible    
    let editorComponent = Selector('div')
                            .child('.CodeMirror')
    
    let editorComponentTextLines = Selector('div')
                                    .child('.CodeMirror-code')

    await t
        .typeText(editorComponent, 'access')
        .expect(editorComponent.innerText).eql('access', 'Some text should have been added to the editor')
        .pressKey('backspace backspace backspace backspace backspace backspace')

    // - The signaling server is up and running
    let signalingServerTest = await tool.setupSignalingServerTest(urlSignaling)
    console.log("Is the signaling server existing : ", signalingServerTest)
    await t
        .expect(signalingServerTest).ok("The signaling server should be running online and opening it should be possible")


    //3. Text is written on the document
    await t
        .typeText(editorComponent, 'Hello, i am the first user')
        .pressKey('enter')
        .pressKey('enter')
        .typeText(editorComponent, 'Have a nice day')
        .pressKey('space')
        .pressKey('space')

    

    //Removing the \n at the beginning of the editor innerText
    let editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)

    //Verifying that the text written during the test is the same as the expected text
    await t
        .expect(tool.normalizeTextForEql(expectedText)).eql(tool.normalizeTextForEql(editorComponentTextValue))
    
    //Verifying the length of the doc
    await t
        .expect(editorComponentTextLines.childElementCount).eql(3)

    //4. Another browser tab is launched, with the url of the previous document.
    await t
        .openWindow('http://localhost:4200/urlDoc')

    //    - The document is opened.
    await t
        .typeText(editorComponent, 'access')
    
    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)

    await t
        .expect(tool.normalizeTextForEql(editorComponentTextValue)).eql(tool.normalizeTextForEql('access' + expectedText), 'Some text should have been added to the editor')
        .pressKey('backspace backspace backspace backspace backspace backspace')
    //    - The signaling server is accessible after a second 
    //    - There should be two user on the document
    //    - Text in the editor should be the exact same as the text written in the previous step.

    //5. The signaling server is killed off
    //    - There should still be two user on the document
    //6. Browser tab 1 adds text to the document. Browser tab 2 adds text to the document
    //    - Browser tab 1 leave the document and then re-join it. The modification bound to this tab should still be visible in the document
    //    - Browser tab 2 leave the document and then re-join it. The modification bound to this tab should still be visible in the document 
    //7. The signaling server is rebooted
    //    - The signaling server is accessible after a few seconds
    //    - Text is merged and appears the same in the two browser tabs



}); 