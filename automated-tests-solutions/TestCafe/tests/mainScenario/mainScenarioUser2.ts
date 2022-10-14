import { tools } from '../../tools';
import { Selector } from 'testcafe';
import * as mainScenarioVariables from './mainScenarioVariables'

let tool = new tools()

fixture`mainScenarioUser2`.page`http://localhost:4200`

test('Additional user for the main scenario (using Google Chrome)', async t => {
//  Initial loading of Mute
    await t.navigateTo(mainScenarioVariables.muteHomeMenu)

//  Wait for the main user to "wake us up" code
    while (mainScenarioVariables.getExecutingTestUser2() != true){
        await t.wait(1000)
    }

//  4. Another browser tab is launched, with the URL of the previous document.
//      - a. The document is opened
    await t.navigateTo(mainScenarioVariables.muteDoc)
    
//  Components that will be tested
    let editorComponent = Selector('div').child('.CodeMirror')
    let editorComponentTextLines = Selector('div').child('.CodeMirror-code')
    let usersComponent = Selector('div').child('.chips-block')

    await t.wait(3000) //  Wait for the selector to be updated and get what's written in the editor

//      - b. The signaling server is accessible after a second
    let signalingServerIsUp = await tool.setupSignalingServerTest(mainScenarioVariables.urlSignaling)
    await t.expect(signalingServerIsUp).ok('4.b. The signaling server is accessible after a few seconds')

//      - c. There should be two user on the document
    let numberOfVisibleUsers = await usersComponent.child(0).childElementCount
    await t.expect(numberOfVisibleUsers).eql(2, '4.c. There should be two users on the document')

//      - d. Text in the editor should be the exact same as the text written in the previous step by User 1.
    let editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    let editorText = tool.normalizeTextForEql(editorComponentTextValue)
    let expectedText = tool.normalizeTextForEql(mainScenarioVariables.expectedText)
    await t.expect(editorText).eql(expectedText, '4.d. Text in the editor should be the exact same as the text written in the previous step by User 1')

//      - e. The editor is accessible by User 2.
    await t.click(editorComponent)
            .pressKey('home up up')
            .typeText(editorComponent, 'access')

    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines) 
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.expectedTextAccessTest)
    await t.expect(expectedText).eql(editorText, '4.e. The editor is accessible by User 2 (access should have been added to the editor)')

//  ----------------Switch to User 1-------------------
    await mainScenarioVariables.stopExecAndResumeOther()
    while (mainScenarioVariables.getExecutingTestUser2() != true){
        await t.wait(1000)
    }

//      - h. The text is back to normal (User 1 removed what was added by User 2)
    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.expectedText)
    await t.expect(editorText).eql(expectedText, '4.h. The text is back to normal (User 1 removed what was added by User 2)')

//  5. The signaling server is killed off
    await tool.stopSignalingServer()

//      - a. The signaling server is unatteignable
    signalingServerIsUp = await tool.setupSignalingServerTest(mainScenarioVariables.urlSignaling)
    await t.expect(signalingServerIsUp).notOk('5.a. The signaling server is unatteignable')

//      - b. There should still be two user on the document
    numberOfVisibleUsers = await usersComponent.child(0).childElementCount
    await t.expect(numberOfVisibleUsers).eql(2, '5.b. There should still be two users on the document (User2)')    

//  - c. Each user can add text to the doc and modification is visible from the other tab
//      - c.1 User 2 adds some text to the editor. 
    await t.typeText(editorComponent, mainScenarioVariables.textAddedWhileOfflineUser2)
    await t.wait(1000) //Wait for the text to be saved in the editor

    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.textAddedWhileOfflineUser2 + mainScenarioVariables.expectedText)
    await t.expect(editorText).eql(expectedText, 'Some text should have been added to the editor - while offline by user 2')  // Verify that text was added in the editor  

//  ----------------Switch to User 1-------------------
    await mainScenarioVariables.stopExecAndResumeOther()
    while (mainScenarioVariables.getExecutingTestUser2() != true){
        await t.wait(1000)
    }

//      - c.3 Text added by User 1 is seen in User 2 tab
    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.textAddedWhileOfflineUser1+ mainScenarioVariables.expectedText)
    let commandToDeleteText = tool.deleteTextFromEditor(mainScenarioVariables.textAddedWhileOfflineUser1, "backspace")
    await t.expect(editorText).eql(expectedText, '5.c.3 Text added by User 1 is seen in User 2 tab')
            .pressKey(commandToDeleteText) // User 2 remove what User 1 added to the editor

//  6. Testing the offline mode
//      - a. Browser tab 2 leave the document and then re-join it. 
    await tool.leaveAndRejoin(t, mainScenarioVariables.muteHomeMenu, mainScenarioVariables.muteDoc)

//          - a.1 User 2 is alone as he left the document and re-joined it while the signaling server was off
    numberOfVisibleUsers = await usersComponent.child(0).childElementCount
    await t.expect(numberOfVisibleUsers).eql(1, ' 6.a.1 User 2 is alone as he left the document and re-joined it while the signaling server was off') 

    await t.click(editorComponent)
            .pressKey('home up up end space') // When we click on the document, we are at the end of the text written in the editor
            .typeText(editorComponent, '(accompanied by a second user)')
            .pressKey('down down backspace backspace')
    
    await tool.leaveAndRejoin(t, mainScenarioVariables.muteHomeMenu, mainScenarioVariables.muteDoc)

//          - a.2. The modification bound to the user 2 tab should still be visible in the document
    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.expectedTextSignalingOffUser2)
    await t.expect(editorText).eql(expectedText, '6.a.2. The modification bound to the user 2 tab should still be visible in the document')

//  ----------------Switch to User 1-------------------            
    await mainScenarioVariables.stopExecAndResumeOther()
    while (mainScenarioVariables.getExecutingTestUser2() != true){
        await t.wait(1000)
    }

//  7. The signaling server is rebooted
//      b. Text is merged and appears the same in the two browser tabs
    editorComponentTextValue = await tool.getTextWrittenInTheCodeMirrorEditor(editorComponentTextLines)
    editorText = tool.normalizeTextForEql(editorComponentTextValue)
    expectedText = tool.normalizeTextForEql(mainScenarioVariables.expectedTextSignalingMerge)
    await t.expect(editorText).eql(expectedText, '7.b. Text is merged and appears the same in the two browser tabs (User 2)')
})