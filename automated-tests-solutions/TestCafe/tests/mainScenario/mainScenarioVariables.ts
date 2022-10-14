let expectedText = 
`Hello, i am the first user

Have a nice day  `

let expectedTextAccessTest =
`accessHello, i am the first user

Have a nice day  `

let textAddedWhileOfflineUser1 ='access while offline by user 1'

let textAddedWhileOfflineUser2 ='access while offline by user 2'

let expectedTextSignalingOffUser1 = 
`Hello, i am the first user
If i was accompanied, i'd say we come in peace
Have a nice day  `

let expectedTextSignalingOffUser2 = 
`Hello, i am the first user (accompanied by a second user)

Have a nice day`

let expectedTextSignalingMerge = 
`Hello, i am the first user (accompanied by a second user)
If i was accompanied, i'd say we come in peace
Have a nice day`

let urlSignaling = 'ws://localhost:8011'

let muteHomeMenu = 'http://localhost:4200'
let muteDoc = 'http://localhost:4200/urlDoc'


export { expectedText, expectedTextAccessTest, textAddedWhileOfflineUser1, textAddedWhileOfflineUser2, expectedTextSignalingOffUser1, expectedTextSignalingOffUser2 , expectedTextSignalingMerge , urlSignaling, muteHomeMenu, muteDoc }

//Variable used to tell if the execution of the code is okay (basically, it stops the code until an action is set in one of the window)
//By default, user 1 execution is set to true (user 1 is the main user, and is the first one to start to test)
var executingTestUser1 = true;
var executingTestUser2 = false;

//Stop current execution and resume the other one
async function stopExecAndResumeOther() {
    if (executingTestUser1){
        executingTestUser1 = false
    } else {
        executingTestUser1 = true
    }
    if (executingTestUser2){
        executingTestUser2 = false
    } else {
        executingTestUser2 = true
    }
    await new Promise( resolve => setTimeout(resolve, 5000)); // Time to wait while the other user goes out of his while loop
}

function getExecutingTestUser1() {
    return executingTestUser1;
}

function getExecutingTestUser2() {
    return executingTestUser2;
}

export { stopExecAndResumeOther, getExecutingTestUser1, getExecutingTestUser2 };
