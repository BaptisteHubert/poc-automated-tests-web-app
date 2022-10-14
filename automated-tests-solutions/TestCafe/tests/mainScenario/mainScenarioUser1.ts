import { tools } from '../../tools';
import { Selector } from 'testcafe';
import * as mainScenarioVariables from './mainScenarioVariables'

let tool = new tools()

fixture`mainScenarioUser1`.page`http://localhost:4200`

test('Main user for the main scenario (using Microsoft Edge)', async t => {

// 1. A browser tab is launched, with the URL of Mute
    await t.navigateTo(mainScenarioVariables.muteDoc) 

//  Components that will be tested
    let editorComponent = Selector('div').child('.CodeMirror')
    let editorComponentTextLines = Selector('div').child('.CodeMirror-code')
    let usersComponent = Selector('div').child('.chips-block')

//  2. A document is opened. 
//      - a. The editor is accessible    
    await t.typeText(editorComponent, 'access')
    let editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    let editorText = tool.normalizeTextForEql(editorComponentTextValue)
    let expectedText = tool.normalizeTextForEql('access')
    let commandToDeleteText = tool.deleteTextFromEditor('access', "backspace")
    await t.expect(editorText).eql(expectedText, '2.a. The editor is accessible')
            .pressKey(commandToDeleteText) // Removing 'access' from the editor

//      - b. The signaling server is accessible after a few seconds
    let signalingServerIsUp = await tool.setupSignalingServerTest(mainScenarioVariables.urlSignaling)
    await t.expect(signalingServerIsUp).ok("2.b. The signaling server is accessible after a few seconds")

//  3. Text is written on the document
    await t.typeText(editorComponent, 'Hello, i am the first user')
            .pressKey('enter')
            .pressKey('enter')
            .typeText(editorComponent, 'Have a nice day')
            .pressKey('space')
            .pressKey('space')

//      - a. The text written in the document is displayed as intended
    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.expectedText)
    await t.expect(editorText).eql(expectedText, '3.a. The text written in the document is displayed as intended')

//  4. Another browser tab is launched, with the url of the previous document. 
//  ----------------Switch to User 2-------------------
    await mainScenarioVariables.stopExecAndResumeOther() //  Wait for the other user to join the document
    while (mainScenarioVariables.getExecutingTestUser1() != true){
        await t.wait(1000)
    }

//      - f. There should be two user on the document
    let numberOfVisibleUsers = await usersComponent.child(0).childElementCount
    await t.expect(numberOfVisibleUsers).eql(2, '4.f. There should be two users on the document')

//      - g. The second user has added some text to the document
    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.expectedTextAccessTest)
    await t.expect(editorText).eql(expectedText, 'g. The second user has added some text to the document')
            .pressKey('home up up delete delete delete delete delete delete') // Go back to the start of the editor and remove what User 2 added

//  ----------------Switch to User 2-------------------
    await mainScenarioVariables.stopExecAndResumeOther()
    while (mainScenarioVariables.getExecutingTestUser1() != true){
        await t.wait(1000)
    }

//  5. The signaling server is killed off

//      - b. There should still be two user on the document
    numberOfVisibleUsers = await usersComponent.child(0).childElementCount
    await t.expect(numberOfVisibleUsers).eql(2, '5.b. There should still be two users on the document (User1)') 

//      - c.2 Text added by User 2 is seen in User 1 tab. (User 2 has added the text 'access while offline by user 2' to the document)
    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.textAddedWhileOfflineUser2 + mainScenarioVariables.expectedText)
    commandToDeleteText = tool.deleteTextFromEditor(mainScenarioVariables.textAddedWhileOfflineUser2, "backspace")
    await t.expect(editorText).eql(expectedText, '5.c.2 Text added by User 2 is seen in User 1 tab.')
            .pressKey(commandToDeleteText) // - User 1 remove what User 2 added to the editor
            .typeText(editorComponent, mainScenarioVariables.textAddedWhileOfflineUser1) // - User 1 adds some text to the editor

    await t.wait(1000) //Wait for the editor to save the text

    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.textAddedWhileOfflineUser1 + mainScenarioVariables.expectedText)
    await t.expect(editorText).eql(expectedText, 'Some text should have been added to the editor - while offline by user 1') // - Verify that text was added in the editor

//  ----------------Switch to User 2-------------------
    await mainScenarioVariables.stopExecAndResumeOther()
    while (mainScenarioVariables.getExecutingTestUser1() != true){
        await t.wait(1000)
    }

//  6. Testing the offline mode

    await tool.leaveAndRejoin(t, mainScenarioVariables.muteHomeMenu, mainScenarioVariables.muteDoc)

    numberOfVisibleUsers = await usersComponent.child(0).childElementCount
    await t.expect(numberOfVisibleUsers).eql(1, '6.b.1. User 1 is alone as he left the document and re-joined it while the signaling server was off') 

    await t.click(editorComponent)
            .pressKey('home up end')
            .typeText(editorComponent, 'If i was accompanied, i\'d say we come in peace')
    
    await tool.leaveAndRejoin(t, mainScenarioVariables.muteHomeMenu, mainScenarioVariables.muteDoc)

    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.expectedTextSignalingOffUser1)
    await t.expect(editorText).eql(expectedText, '6.b.2. The modification bound to the user 1 tab should still be visible in the document')

//  7. The signaling server is rebooted
    await tool.startSignalingServer()

//      - a. The signaling server is accessible after a few seconds
    signalingServerIsUp = await tool.setupSignalingServerTest(mainScenarioVariables.urlSignaling)
    await t.expect(signalingServerIsUp).ok("7.a. The signaling server is accessible after a few seconds")

//      - b. Text is merged and appears the same in the two browser tabs
    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.expectedTextSignalingMerge)
    await t.expect(editorText).eql(expectedText, '7.b. Text is merged and appears the same in the two browser tabs (User 1)')

//  ----------------Switch to User 2-------------------
    await mainScenarioVariables.stopExecAndResumeOther()
})