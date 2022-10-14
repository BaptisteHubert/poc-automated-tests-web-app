import { WebSocket } from 'ws';
import { exec } from 'child_process'
import createTestCafe from "testcafe";


//This class lists tool function that can be used across the TestCafe project
export class tools{

    constructor(){
    }
    
    //----------------Getting the text written in the editor----------------
    public async getTextWrittenInTheCodeMirrorEditor(codeMirrorCode : Selector) : Promise<string>{
        let textWrittenInTheEditor = ``
        let numberOfLines = await codeMirrorCode.childElementCount
        for (let i = 0 ; i < numberOfLines ; i++ ){
            //editorLines.child is the CodeMirror-line
            let codeMirrorLine = await codeMirrorCode.child(i)
            //editorLines.child.child(0) is the span in the CodeMirror-line element
            let codeMirrorLineChild = await codeMirrorLine.child(0)
            if (await codeMirrorLineChild.hasChildElements){
                let childIsCodeMirrorCursor = await codeMirrorLineChild.child(0).hasClass("CodeMirror-widget")
                if (childIsCodeMirrorCursor){
                    let customSelector = <CustomSelector>codeMirrorLineChild.addCustomDOMProperties({
                        innerHTML: el => el.innerHTML
                    })
                    textWrittenInTheEditor += await this.handleCodeMirrorUserCursor(customSelector) + "\n"
                } else {
                    textWrittenInTheEditor += await codeMirrorLineChild.innerText  + "\n"
                }
            } else {
                textWrittenInTheEditor += await codeMirrorLineChild.innerText  + "\n"
            }
        }
        //Remove the last newline
        textWrittenInTheEditor = textWrittenInTheEditor.slice(0,-1)
        return textWrittenInTheEditor
    }

    //Handles the line where the cursor of another user might appear and add the name of the user to the editor text value
    public async handleCodeMirrorUserCursor(cs : CustomSelector) : Promise<string>{
        let textValueWithoutCursorFinal = ''
        let htmlCode = await cs.innerHTML
        const getRidOfCodeMirrorCursorRegex = /(<span[^>]*class=\"CodeMirror-widget\"[^>]*>(.*?)<\/span>)((<\/span[>])*)/g
        let textValueWithoutCursorStep1 = await htmlCode.replace(getRidOfCodeMirrorCursorRegex, "")
        let textValueWithoutCursorStep2 = textValueWithoutCursorStep1.replace(/&nbsp;*/gm, " ")
        textValueWithoutCursorFinal += textValueWithoutCursorStep2
        return textValueWithoutCursorFinal
    }


    //------------------Normalizing or formatting data----------------

    //Normalize a string with newline and spaces for equality testing
    public normalizeTextForEql(str : string){
        //Simplifying the string
        let strTransformStep1 = JSON.stringify(str)

        //Removing control characters
        let strTransformStep2 = strTransformStep1.replace(/\p{C}/gu, '')

        //Normalizing space and newlines
        let strNormalizeStepFinal = this.normalizeNewlineAndSpace(strTransformStep2)
        return strNormalizeStepFinal 

    }

    private normalizeNewlineAndSpace(str : string) {
        // Normalizing newline
        let strNormalized = str.replace(/\n\r/g, '\n');
        strNormalized = strNormalized.replace(/\p{Zl}/gu, '\n');
        strNormalized = strNormalized.replace(/\p{Zp}/gu, '\n');
        // Normalizing space
        strNormalized = strNormalized.replace(/\p{Zs}/gu, ' ');
        return strNormalized;
    }

    //Useful for when we have to delete a long sequence of characters from the editor
    public deleteTextFromEditor(strToRemove : string, typeOfRemoval : string) : string{
        let commandToRemoveString = ''
        for (let i = 0 ; i < strToRemove.length; i++){
            if (typeOfRemoval == "backspace") {
                commandToRemoveString += 'backspace '
            }
            if (typeOfRemoval == "delete") {
                commandToRemoveString += 'delete '
            }
        }
        return commandToRemoveString
    }

    //----------------Network testing----------------
    public async setupSignalingServerTest(url : string) : Promise<boolean>{
        let ws = new WebSocket(url)
        let isSignalingServerAccessible = true
        
        //If the signaling server isn't up, then this following code should be executed
        ws.onerror = function(){
            isSignalingServerAccessible = false
        }

        //Waiting for an error (one will happen if the signaling server is not running online)
        await new Promise(resolve => setTimeout(resolve, 2500));

        return isSignalingServerAccessible
    }

    public async startSignalingServer(){
        this.handleSignalingServer("start")
        await this.waitAfterActionOnSignaling(7500)
    }

    public async stopSignalingServer(){
        this.handleSignalingServer("stop")
        await this.waitAfterActionOnSignaling(3500)
    }

    public async waitAfterActionOnSignaling(timeToWait : number){
        await new Promise(resolve => setTimeout(resolve, timeToWait)); 
    }


    public handleSignalingServer(option : string){
        let commandFullLine = 'cd ../../web-app/ && sh docker_actions.sh ' + option
        exec(commandFullLine, (err, stdout, stdrr) => {
            /* Uncomment if there is an error during execution of a test
            console.log("Error : ", err)
            console.log("stdout : ", stdout)
            console.log("stdrr : ", stdrr)
            */
        })
    }

    //----------------Documents testing----------------
    public async leaveAndRejoin(t : TestController, muteHomeMenuURL : string, documentURL : string){
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait before quitting the doc to make sure text is saved in the editor
        await t.navigateTo(muteHomeMenuURL)
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for desynchronization to happen completely
        await t.navigateTo(documentURL)
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait after joining the doc for the text to appear
    }


    //----------------Launching a TestCafe runner----------------
    public async launchRunner(pathToFile : string, browser : string) {
        const testcafe = await createTestCafe("localhost");
        const runner = testcafe.createRunner();
        const failed = await runner
            .src(pathToFile)
            .browsers(browser)
            .run({stopOnFirstFail : true})
        console.log('Tests failed: ' + failed);
    }

}

//The interface used for adding custom DOM properties to TestCafe Selector
interface CustomSelector extends Selector {
    innerHTML: Promise<any>;
}