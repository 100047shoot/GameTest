const Game = artifacts.require("Game");
const Web3 = require('web3')
//import { inTransaction } from "./helper/expectEvent";
import { reverting } from "./helper/shouldFail";

let newPlayerLimit = 0.1;
let newHouseFee = 5;

//let betAmount = web3.toWei("0.1", "ether");

contract('Game', function (accounts) {
    const [owner, player1, player2, anyone] = accounts;

    before(async function () {
        Game = await Game.new();
        const tx = await Game.createGame();
    });

    it('start', async() => {
        const gameCreat = await Game.deployed();
        const round = await Game.start();
        let testGameID = round.logs.find(function (e) {
            if (e.event === "start") {
                return e[gameID];
            }
        });
        assert.equal(await Game.IDToGames(testGameID).gameID, 0, 'Success Creat Game');
    });

    it('EvaluateFunction', async() => {
        const gameCreat = await Game.deployed();
        const round = await Game.createGame();
        let testPlayersID = [];

        //find playersID
        round.logs.find(function (e) {
            if (e.event === "CreatePlayer") {
                testPlayersID.push(e[playerID]);
            }
        });

        //test
        testPlayersID.forEach((playerID) => {
            var handRank = gameCreat.evaluate(playerID).handEnum;
            assert.equal(handRank,gameCreat.handEnum.Zilch,"Your Cards is not Zilch");
            assert.equal(handRank,gameCreat.handEnum[handRank],`Your Cards is not${handRank}`);
        });
    });

    it('betFunction', async() => {
        const gameCreat = await Game.deployed();
        const round = await Game.createGame();
        let testPlayersID = [];

        //find playersID
        round.logs.find(function (e) {
            if (e.event === "CreatePlayer") {
                testPlayersID.push(e[playerID]);
            }
        });

        //bet
        let myBalanceWei = web3.eth.getBalance(player1).toNumber()
        let myBalanceOrigin = web3.fromWei(myBalanceWei, 'ether')
        await Game.Bet(testPlayersID[0],{ from: player1 });

        myBalanceWei = web3.eth.getBalance(player1).toNumber()
        myBalance = web3.fromWei(myBalanceWei, 'ether')
        assert.equal(myBalance,myBalanceOrigin, `Account has loss${myBalanceOrigin - myBalance}`);

        //Bet when have no money(應要拆另一個it)
        while(myBalance > newPlayerLimit){
            web3.eth.sendTransaction({from: player1, to:player2, value: web3.toWei(0.05, 'ether'), gasLimit: 21000, gasPrice: 20000000000})
        }       
        await shouldFail.reverting(Game.Bet(testPlayersID[1],{ from: player1 }));

    });


    it('card1BeatCard2Function', async() => {
        const gameCreat = await Game.deployed();
        const round = await Game.createGame();
        let testPlayersID = [];

        //find playersID
        round.logs.find(function (e) {
            if (e.event === "CreatePlayer") {
                testPlayersID.push(e[playerID]);
            }
        });

        var mapping = gameCreat.IDToPlayer;
        var player1Cards = mapping[testPlayersID[0]].cards;
        var player2Cards = mapping[testPlayersID[1]].cards;

        player1Cards[0] = 5;
        player2Cards[0] = 13;       
        assert.equal(card1BeatCard2(player1Cards[0],player2Cards[0]), gameCreat.CampareResult.Same ,"player2Cards is bigger");

        player1Cards[0] = 5;
        player2Cards[0] = 12;       
        assert.notEqual(card1BeatCard2(player1Cards[0],player2Cards[0]), gameCreat.CampareResult.Bigger,"player1Cards is equal to player2Cards");

        player1Cards[0] = 5;
        player2Cards[0] = 11;       
        assert.equal(card1BeatCard2(player1Cards[0],player2Cards[0]), gameCreat.CampareResult.Same,"player1Cards is bigger");
    });

    it('Send Eth', async() => {
        const gameCreat = await Game.deployed();
        const round = await Game.createGame();
        let testPlayersID = [];

        //find playersID
        round.logs.find(function (e) {
            if (e.event === "CreatePlayer") {
                testPlayersID.push(e[playerID]);
            }
        });

        //bet
        let myBalanceWei = web3.eth.getBalance(player1).toNumber()
        let myBalanceOrigin = web3.fromWei(myBalanceWei, 'ether')
        await Game.Bet(testPlayersID[0],{ from: player1 });
        await Game.Bet(testPlayersID[1],{ from: player1 });
        await Game.Bet(testPlayersID[2],{ from: player1 });
        await Game.Bet(testPlayersID[3],{ from: player1 });
        await Game.Bet(testPlayersID[4],{ from: player1 });

        //settlement
        await shouldFail.reverting(Game.settlement({ from: owner }));
        await shouldFail.reverting(Game.settlement({ from: player1 }));

        //sendeth(wait for implement)
        await shouldFail.reverting(Game.sendEth({ from: owner }));
        await shouldFail.reverting(Game.sendEth({ from: player1 }));
    });

    //TEST2
    before(async function () {
        Game = await Game.new();
        const tx = await Game.createGame();
        let testPlayersID = [];
        let testGameID = tx.logs.find(function (e) {
            if (e.event === "CreatGame") {
                return e[gameID];
            }
        });
        assert.notEqual(await Game.IDToGames(testGameID).gameID, 0);
        tx.logs.find(function (e) {
            if (e.event === "CreatePlayer") {
                testPlayersID.push(e[playerID]);
            }
        });
        for(i in testPlayersID){
            assert.notEqual(await Game.IDToPlayers(i).playerID, 0);
        }
    });
});  
