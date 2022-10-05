import createTestCafe from "testcafe";

const testcafe = await createTestCafe("localhost", 1337, 1338);

export class runner{

    public constructor(){
        this.launchRunner()
    }

    public async launchRunner(){
        try {
            const runner = testcafe.createRunner();
    
            const result = await runner
                .src(["tests/mainScenario.ts"])
                .browsers(["chrome"])
                .run();
    
            console.log('Number of tests failed: ' + result);
        }
        finally {
            await testcafe.close();
        }  
    }
}

let r = new runner()