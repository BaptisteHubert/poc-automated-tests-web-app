import { Selector } from 'testcafe';
import { tools } from '../tools';

fixture`Main Scenario`.page`http://localhost:4200`

let tool = new tools()

//The expected text that should be written in the CodeMirror editor
let expectedText = 
`Hello, i am the first user

Have a nice day  `

test('My first test', async t => {
    
    console.log("--Testing the main scenario--")

    // 1. A browser tab is launched, with the url of mute.
    await t.
        navigateTo('http://localhost:4200/urlDoc')

    //2. A document is opened. 
    // - An editor is accessible 
    // - The signaling server is accessible after a few seconds
    
    //Selecting the DOM element - the editor
    let editorComponent = Selector('div')
                            .child('.CodeMirror')

    //3. Text is written on the document
    await t
        .typeText(editorComponent, 'Hello, i am the first user')
        .pressKey('enter')
        .pressKey('enter')
        .typeText(editorComponent, 'Have a nice day')
        .pressKey('space')
        .pressKey('space')

    let editorTextComponent = Selector('div')
                            .child('.CodeMirror-code')

    //Removing the \n at the beginning of the editor innerText
    let editorComponentTextValue = await (await editorComponent.innerText).slice(2)

    //Verifying that the text written during the test is the same as the expected text
    await t
        .expect(tool.normalizeTextForEql(expectedText)).eql(tool.normalizeTextForEql(editorComponentTextValue))
    

    //Verifying the length of the doc
    console.log("Number of lines : ", await editorTextComponent.childElementCount )
    
    await t
        .expect(editorTextComponent.childElementCount).eql(3)

}); 