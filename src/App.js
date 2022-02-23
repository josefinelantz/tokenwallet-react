/*
Uses the injected web3 object to connect to the Ganache blockchain and set the network in the navigation bar. 
Asynchronously access MetaMask for account authorization. 
Define Transfer, Approve and Mint methods for interactiong with the token contracts. 
Set the state and pass the relevant props to the container component before each operation is carried out. 
*/

import React, { Component } from "react";
import Web3 from "web3";
import Tokens20 from "./tokens/all20";
import Tokens721 from "./tokens/all721";
import Nav from "./components/Nav";
import Description from "./components/Description";
import Container from "./components/Container";
import InstallMetamask from "./components/InstallMetamask";

class App extends Component {
  /*
  Define constructor and set the initial values for the state variables. 
  */
  constructor(){
    super();
    // Import the token interfaces
    this.tokens20 = Tokens20;
		this.tokens721 = Tokens721;
    // Set the app name
    this.appName = "TokenWallet";
    // Define state variables for each operation being carried out.
    // Set the default and initial values for the form fields using bind
    // to enable the child components to change the state.
    this.isWeb3 = true;                 
    this.newTransfer20 = this.newTransfer20.bind(this);
		this.newTransfer721 = this.newTransfer721.bind(this);
		this.newMint20 = this.newMint20.bind(this);
		this.newMint721 = this.newMint721.bind(this);
		this.newApprove20 = this.newApprove20.bind(this);
		this.newApprove721 = this.newApprove721.bind(this);
    this.closeTransfer = this.closeTransfer.bind(this);
    this.onInputChangeUpdateField = this.onInputChangeUpdateField.bind(this);
    
    this.state = {
      inProgress: false,
      tx20: null,
			tx721: null,
      network: "Checking...",
      account: null,
      tokens20: [],
			tokens721: [],
      transferDetail20: {},
			transferDetail721: {},
			mintDetail20: {},
			mintDetail721: {},
			approveDetail20: {},
			approveDetail721: {},
      fields: {
        receiver: null,
        amount: null,
				metadata: null,
				tokenId: null,
        gasPrice: null,
        gasLimit: null,
      },
      defaultGasPrice: null,
      defaultGasLimit: 200000
    };
	}
  
  setNetwork = () => {
    let networkName,that = this;
		
    this.web3.eth.net.getId(function (err, networkId) {
      switch (networkId) {
        case "1":
          networkName = "Main";
        break;
        case "2":
          networkName = "Morden";
        break;
        case "3":
          networkName = "Ropsten";
        break;
        case "4":
          networkName = "Rinkeby";
        break;
        case "42":
          networkName = "Kovan";
        break;
        default:
          networkName = networkId;
      }

      that.setState({
        network: networkName
      })
    });
  };

	newTransfer20 = (index) => {
    this.setState({
      transferDetail20: this.state.tokens20[index]
    })
  };

	newTransfer721 = (index) => {
    this.setState({
      transferDetail721: this.state.tokens721[index]
    })
  };

	newMint20 = (index) => {
    this.setState({
      mintDetail20: this.state.tokens20[index]
    })
  };

	newMint721 = (index) => {
    this.setState({
      mintDetail721: this.state.tokens721[index]
    })
  };

	newApprove20 = (index) => {
    this.setState({
      approveDetail20: this.state.tokens20[index]
    })
  };

	newApprove721 = (index) => {
    this.setState({
      approveDetail721: this.state.tokens721[index]
    })
  };

	closeTransfer = () => {
    this.setState({
      transferDetail20: {},
			transferDetail721: {},
			mintDetail20: {},
			mintDetail721: {},
			approveDetail20: {},
			approveDetail721: {},
      fields: {},
    })
	};

  setGasPrice = () => {
    this.web3.eth.getGasPrice((err,price) => {
      var Gasprice = this.web3.utils.fromWei(price,'gwei');
      if(!err) this.setState({defaultGasPrice: Gasprice})
    });
  };

  resetApp = () => {
    this.setState({
      transferDetail20: {},
		  transferDetail721: {},
      fields: {
        receiver: null,
        amount: null,
        gasPrice: null,
        gasLimit: null,
			  metadata: null,
			  tokenId: null,
      },
      defaultGasPrice: null,
    })
	  window.location.reload();	
  };
  // Transfer method is used to transfer token between Ethereum addresses.
  Transfer = () => {
    // Set inProgress state variable to true. Child components can recognize that the current state is a transfer in progress.
    this.setState({
      inProgress: true
    });
		
    // Set default account
	  //this.web3.eth.defaultAccount = window.web3.defaultAccount;
		
    // Initialize contract object 
    let contract;
    // Check whether token is ERC20 or ERC721 by checking transferDetail state variable for metadata == ERC721. 
		if (this.state.fields.metadata) {
		 	contract = new this.web3.eth.Contract(this.state.transferDetail721.abi,this.state.transferDetail721.address);
		} else {
      contract = new this.web3.eth.Contract(this.state.transferDetail20.abi,this.state.transferDetail20.address);
		}
		
		let app = this; 
		let metadata;
		let tokenId;
		let amount;
		// Assign state variable values to local variables.
		if(this.state.fields.metadata) {
		 	metadata = this.state.fields.metadata;
		 	tokenId = this.state.fields.tokenId;
		} else {
			amount = this.state.fields.amount*(Math.pow(10,this.state.transferDetail20.decimal));			
		}	
    
    let receiver = this.state.fields.receiver.toString();
		let account = this.state.account;
    // If metadata is stored call transferNFT method. 
		if(metadata) { 
			contract.methods.transferNFT(account,receiver, tokenId, metadata).send({from: this.web3.eth.defaultAccount}).then(function(response,err) {	
				if(response) {
          console.log(response);
					app.resetApp();
          app.setState({
            tx20: response.tx20,
						tx721: response.tx721,
            inProgress: false
          });
 				} else	{
          console.log(err);
        }
			});
		} else {
      // No metadata stored call transfer method.
			contract.methods.transfer(receiver, amount).send({from: this.web3.eth.defaultAccount}).then(function(response,err) {
        // Successful respons, reset App which resets the state variables and sets inProgress to false. 
				if(response) {
          console.log(response);
 	        app.resetApp();
          app.setState({
            tx20: response.tx20,
						tx721: response.tx721,
            inProgress: false
          });
        } else {
          console.log(err);
        }
      });
		}	    
	};
  // Similar to Tranfer, but is invoked when user clicks the mint button. 
  Mint = () => {
    this.setState({
      inProgress: true
    });
		
		//this.web3.eth.defaultAccount = window.web3.defaultAccount;
		
    let contract;
		if (this.state.fields.metadata) {
		  contract = new this.web3.eth.Contract(this.state.mintDetail721.abi, this.state.mintDetail721.address);
		} else {
      contract = new this.web3.eth.Contract(this.state.mintDetail20.abi, this.state.mintDetail20.address);
		}
		
    let app = this; 
		let metadata;
		let amount;
		
		if(this.state.fields.metadata) {
		 metadata = this.state.fields.metadata;
		} else {
		  amount = this.state.fields.amount*(Math.pow(10,this.state.mintDetail20.decimal));	
		}	
        
    let receiver = this.state.fields.receiver.toString();
		// If ERC721 call createNFT in Condos contract.		
		if(metadata) {
			contract.methods.createNFT(receiver, metadata).send({from: this.web3.eth.defaultAccount}).then(function(response) {
        if(response) {
          console.log(response);
				  app.resetApp();
          app.setState({
            tx20: response.tx20,
						tx721: response.tx721,
            inProgress: false
          });
 				}
			});
		} else {
			contract.methods.mint(receiver, amount).send({from: this.web3.eth.defaultAccount}).then(function(response) {
        if(response) {
          console.log(response);
          app.resetApp();

          app.setState({
            tx20: response.tx20,
						tx721: response.tx721,
            inProgress: false
          });
        }
      });
		}    
	};
  // Checks whether the user is approving an ERC20 token or an ERC721 token. 
  Approve = () => {
    this.setState({
      inProgress: true
    });
		
    let contract;
    // If ERC721 send tokenId and the account to approve.
		if (this.state.approveDetail721.abi) {
		  contract = new this.web3.eth.Contract(this.state.approveDetail721.abi,this.state.approveDetail721.address);	
		} else {
      // If ERC20 send account and balance to approve.
      contract = new this.web3.eth.Contract(this.state.approveDetail20.abi,this.state.approveDetail20.address);
		}

		let app = this;
    let receiver = this.state.fields.receiver.toString();
		
		if (this.state.approveDetail20.abi) {
		  let amount = this.state.fields.amount* (Math.pow(10,this.state.approveDetail20.decimal));	
		
		  contract.methods.approve(receiver, amount).send({from: this.web3.eth.defaultAccount}).then(function(response) {
			  if(response) {
          app.resetApp();
          app.setState({
            tx20: response.tx20,
					  tx721: response.tx721,
            inProgress: false
          });
        }
      });
		} else {
		  let tokenid = this.state.fields.tokenId;
		  contract.methods.approve(receiver, tokenid).send({from: this.web3.eth.defaultAccount}).then(function(response) {
			  if(response) {
          console.log(response);
          app.resetApp();
          app.setState({
            tx20: response.tx20,
						tx721: response.tx721,
            inProgress: false
          });
        }
      });
		}			    
	};

  onInputChangeUpdateField = (name,value) => {
    let fields = this.state.fields;
    fields[name] = value;
    this.setState({
      fields
    });
  };
  // Tasks to carry out after App is rendered.
  componentDidMount(){
		let account;
    // Post November 2018 MetaMask does not inject the Ethereum provider with user accounts by default. To access user accounts DApp must asynchronously call the Ethereum.enable() method. 
    // Hence, we first check wether the window.Ethereum object is available. 
		if (window.ethereum) {
      const ethereum = window.ethereum;
      // To provide compatability with legacy code, map the window.Ethereum object to window.web3. Also map to window.Ethereum i.e current provider. 
      window.web3 = new Web3(ethereum);
	    this.web3 = new Web3(ethereum);
      // Async call MetaMask to ask for permission to the injected Ethereum provider with user accounts. 
		  ethereum.enable().then((accounts) => {
		    account = accounts[0];
 		    this.web3.eth.defaultAccount = account;
        // Initialize this for the app.
		    let app = this;
        // Set account state variable to the default account. 
		    this.setState({
          account
        });
        // Call setNetwork to set Navbar to local blockchain.
        this.setNetwork();
        // Get default gasprice for Navbar.
        this.setGasPrice();
        // Loop through tokens listed in all20.js, for each token we set contract parameter using its ABI and address. 
        Tokens20.forEach((token) => {
          let erc20Token = new this.web3.eth.Contract(token.abi, token.address);
          // Get balance for each token for the default account. 
          erc20Token.methods.balanceOf(account).call().then(function(response) {
            // Get all other params from token's component file. 
            if(response) {
              let decimal = token.decimal;
              let precision = '1e' + decimal;
              let balance = response / precision;
              let name = token.name;
              let symbol = token.symbol;
              let icon = token.icon;
              let abi = token.abi;
              let address = token.address;
              balance = balance >= 0 ? balance : 0;
              let tokens20 = app.state.tokens20;

              if(balance > 0) tokens20.push({
                decimal,
                balance,
                name,
                symbol,
                icon,
                abi,
                address,
              });
              
              app.setState({
                tokens20
              })
            }
          });
        });
        // Loop through tokens available in all721.js.  
		    Tokens721.forEach((token721) => {
          let erc721Token = new this.web3.eth.Contract(token721.abi, token721.address);
          //Fetch tokenId and the mapped metadata for each token from the public hashmap MDTrack in ERC721 contract.
          erc721Token.methods.MDTrack(account).call().then(function (response) {
				if(response) {
          let name = token721.name;
          let symbol = token721.symbol;
          let icon = token721.icon;
          let abi = token721.abi;
          let address = token721.address;
					let tokenid = response;	
          tokenid = tokenid >= 0 ? tokenid : 0;
					if(tokenid!==0) {
					  erc721Token.methods.tokenURI(tokenid).call().then(function (response) {
						  if(response) {
						    let metadata = response;                
						    let tokens721 = app.state.tokens721;
                tokens721.push({
                  name,
                  symbol,
						      tokenid,		
                  icon,
                  abi,
                  address,
						      metadata,
                });

                app.setState({
                  tokens721
                })
					    }
            });
          }
			  }
			});
    });
	})
}
}						   

render() {
  // Check if the app can detect a web3 instance.
  if(this.isWeb3) {   
    // If web3 instance the app renders and sends the state parameters to the Container component, which then redistributes it beteween the child components. 
    return (
      <div>
        <Nav appName={this.appName} network={this.state.network} />
        <Description />
        <Container 
          onInputChangeUpdateField={this.onInputChangeUpdateField}
          transferDetail20={this.state.transferDetail20}
					transferDetail721={this.state.transferDetail721}
					mintDetail20={this.state.mintDetail20}
					mintDetail721={this.state.mintDetail721}
					approveDetail20={this.state.approveDetail20}
					approveDetail721={this.state.approveDetail721}
          closeTransfer={this.closeTransfer}
          newTransfer20={this.newTransfer20}
					newTransfer721={this.newTransfer721}
					newApprove20={this.newApprove20}
					newApprove721={this.newApprove721}
					newMint20={this.newMint20}
					newMint721={this.newMint721}
          Transfer={this.Transfer}
					Mint={this.Mint}
					Approve={this.Approve}
          account={this.state.account}
          defaultGasPrice={this.state.defaultGasPrice}
          defaultGasLimit={this.state.defaultGasLimit}
          tx20={this.state.tx20}
					tx721={this.state.tx721}
          inProgress={this.state.inProgress}
          fields={this.state.fields}
          tokens20={this.state.tokens20}
				  tokens721={this.state.tokens721}
        />
      </div>
    )
  } else {
    // If unable to detect a web3 instance, show notification to user to install MM.
    return(
      <InstallMetamask />
    )
  }
}
}
export default App;