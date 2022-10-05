//This class lists tool function that can be used across the TestCafe project
export class tools{

    constructor(){
    }

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
}