import { WebSocket } from 'ws';
//This class lists tool function that can be used across the TestCafe project
export class tools{

    constructor(){
    }

    //----------------Normalizing or formatting data----------------

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