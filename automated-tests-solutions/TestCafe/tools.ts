import { WebSocket } from 'ws';
//This class lists tool function that can be used across the TestCafe project
export class tools{

    constructor(){
    }

    //----------------Getting text written in the editor----------------
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

    public normalizeNewlineAndSpace(str : string) {
        // Normalizing newline
        let strNormalized = str.replace(/\n\r/g, '\n');
        strNormalized = strNormalized.replace(/\p{Zl}/gu, '\n');
        strNormalized = strNormalized.replace(/\p{Zp}/gu, '\n');
        // Normalizing space
        strNormalized = strNormalized.replace(/\p{Zs}/gu, ' ');
        return strNormalized;
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
}

//The interface used for adding custom DOM properties to TestCafe Selector
interface CustomSelector extends Selector {
    innerHTML: Promise<any>;
}