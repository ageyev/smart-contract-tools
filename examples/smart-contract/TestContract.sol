pragma solidity ^0.4.21;

/* ----------------- */

//  this is expected from another contracts
//  if it wants to spend tokens of behalf of the token owner in our contract
//  this can be used in many situations, for example to convert pre-ICO tokens to ICO tokens
//  see 'approveAndCall' function
contract allowanceRecipient {
    function receiveApproval(address _from, uint256 _value, address _inContract, bytes _extraData) public returns (bool success);
}

// see:
// https://github.com/ethereum/EIPs/issues/677
contract tokenRecipient {
    function tokenFallback(address _from, uint256 _value, bytes _extraData) public returns (bool success);
}

/*-------------------*/

contract TestContract {
    /* ---------- Variables */

    /* --- ERC-20 variables */

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#name
    // function name() constant returns (string name)
    string public name = "test";

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#symbol
    // function symbol() constant returns (string symbol)
    string public symbol = "tst";

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#decimals
    // function decimals() constant returns (uint8 decimals)
    uint8 public decimals = 0;

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#totalsupply
    // function totalSupply() constant returns (uint256 totalSupply)
    // we start with zero and will create tokens as SC receives ETH
    uint256 public totalSupply;

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#balanceof
    // function balanceOf(address _owner) constant returns (uint256 balance)
    mapping(address => uint256) public balanceOf;

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#allowance
    // function allowance(address _owner, address _spender) constant returns (uint256 remaining)
    mapping(address => mapping(address => uint256)) public allowance;

    /* ---- other variables */
    address public owner;

    // this can be used as a key for all events in the contract
    uint256 public etherReceivedEventIndex = 0;
    uint256 public tokensCreatedEventsIndex = 0;
    // can be used as a key to store events in DB
    uint256 public tokenTransferEventIndex = 0;

    /* ---------- Constructor */
    // do not forget about:
    // https://medium.com/@codetractio/a-look-into-paritys-multisig-wallet-bug-affecting-100-million-in-ether-and-tokens-356f5ba6e90a
    function TestContract() public {
        owner = msg.sender;
        // ---- events:
        etherReceivedEventIndex = 0;
    }

    //
    /* --- ERC-20 events */
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#events

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#transfer-1
    event Transfer(address indexed from, address indexed to, uint256 value);
    // >>> non-standart event:
    event tokensTransfer(
        uint indexed index, // 1
        address indexed from, // 2
        address indexed to, // 3
        uint256 value
    );

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#approval
    event Approval(address indexed _owner, address indexed spender, uint256 value);

    /* --- ERC-20 Functions */
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#methods

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#transfer
    function transfer(address _to, uint256 _value) public returns (bool){
        return transferFrom(msg.sender, _to, _value);
    }

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#transferfrom
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool){

        // Transfers of 0 values MUST be treated as normal transfers and fire the Transfer event (ERC-20)
        require(_value >= 0);

        // The function SHOULD throw unless
        // 1) the _from account has deliberately authorized the sender of the message via some mechanism
        // 2) the _from account is the same as msg.sender
        require(msg.sender == _from || _value <= allowance[_from][msg.sender]);

        // check if _from account have required amount
        require(_value <= balanceOf[_from]);

        // Subtract from the sender
        balanceOf[_from] = balanceOf[_from] - _value;
        //
        // Add the same to the recipient
        balanceOf[_to] = balanceOf[_to] + _value;

        // If allowance used, change allowances correspondingly
        if (_from != msg.sender) {
            allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;
        }

        // event >>> here, not in 'transfer' << this is for standart
        emit Transfer(_from, _to, _value);
        tokenTransferEventIndex = tokenTransferEventIndex + 1;
        return true;
    }

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md#approve
    // there is and attack, see:
    // https://github.com/CORIONplatform/solidity/issues/6,
    // https://drive.google.com/file/d/0ByMtMw2hul0EN3NCaVFHSFdxRzA/view
    // but this function is required by ERC-20
    function approve(address _spender, uint256 _value) public returns (bool success){

        require(_value >= 0);

        allowance[msg.sender][_spender] = _value;

        // event
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    // ether:
    event EtherReceived(address indexed from, uint indexed value);
    event TokensCreated(address indexed to, uint indexed value, uint indexed tokenPriceInWei);

    uint public tokenPriceInWei = 500000000000000; // 0.0005 ETH

    function() public payable {
        emit EtherReceived(msg.sender, msg.value);
        balanceOf[msg.sender] = balanceOf[msg.sender] + (msg.value / tokenPriceInWei);
        emit TokensCreated(msg.sender, msg.value / tokenPriceInWei, tokenPriceInWei);
    }

}
