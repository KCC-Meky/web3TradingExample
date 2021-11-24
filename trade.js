const Web3 = require('web3');
const { abi } = require('./artifacts/contracts/KuSwapRouter02.sol/KuswapRouter02.json');
const web3 = new Web3(`https://rpc-testnet.kcc.network`);
const privateKey = ""; // private key here without 0x 
const routerAddress = '0xc5f442007e08e3b13C9f95fA22F2a2B9369d7C8C'; // Kuswap Router
const fromToken = '0x67f6a7BbE0da067A747C6b2bEdF8aBBF7D6f60dc'; // USDT
const toToken = '0xB296bAb2ED122a85977423b602DdF3527582A3DA'; // WKCS

const activeAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
const routerContract = new web3.eth.Contract(abi, routerAddress);
var expiryDate = Math.floor(Date.now() / 1000) + 9000;
qty = web3.utils.toBN(web3.utils.toWei('1'))

async function swapExactTokensForTokens(qty, minimalAmount, fromToken, toToken, expiryDate, times) {
	if (times == 0) {
		return
	}

	let tx_builder = routerContract.methods.swapExactTokensForTokens(qty, 0, [fromToken, toToken], activeAccount.address, expiryDate);
	let encoded_tx = tx_builder.encodeABI();
	let transactionObject = {
		gas: 200000,
		data: encoded_tx,
		from: activeAccount.address,
		to: routerAddress,
	};

	await web3.eth.accounts.signTransaction(transactionObject, activeAccount.privateKey, (error, signedTx) => {
		if (error) {
			console.log(error);
		} else {
			web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', (receipt) => {
				(async () => {
                    console.log(receipt['blockHash'])
					expiryDate = Math.floor(Date.now() / 1000) + 9000;
					swapExactTokensForTokens(qty, minimalAmount, fromToken, toToken, expiryDate, times - 1)
				})()
			})
		}
	});
}

swapExactTokensForTokens(qty, 0, fromToken, toToken, expiryDate, 2);
