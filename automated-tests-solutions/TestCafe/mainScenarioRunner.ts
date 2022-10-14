import createTestCafe from "testcafe";
import { tools } from './tools.js';
let tool = new tools()
const testCafe = await createTestCafe("localhost");

export class mainScenarioRunner{

    public constructor(){
    }

    public async launchAllRunners(){
        try {
            await Promise.race([
                tool.launchRunner('tests/mainScenario/mainScenarioUser1.ts', 'edge'),
                tool.launchRunner('tests/mainScenario/mainScenarioUser2.ts', 'chrome'),
            ])
        } catch (error){
            console.log("There has been an error durring the execution : ", error)
            await testCafe.close();
            process.exit(1) // There has been an error
        }
        finally {
            console.log("All tests have ended")
            await testCafe.close();
            process.exit(0) // The runners have been successfull
        }
    }
}

let runner = new mainScenarioRunner()
await runner.launchAllRunners()