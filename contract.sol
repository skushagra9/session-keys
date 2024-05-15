// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract DepositContract {
    bytes32 public immutable DOMAIN_SEPARATOR;

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("DepositContract")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }
    struct Keys {
    address trader;
   bytes32 signkey;
}

bytes32 private constant KEY_TYPE_HASH = keccak256(
    "Keys(address owner, bytes32 signkey)"
);

mapping(address => uint256) public deposits;
event Deposit(address indexed depositor, uint256 amount);

function verify(
    address person,
    uint amount,
    uint8 v,
    bytes32 r,
    bytes32 s,
    bytes32 signkey) external {
    deposits[msg.sender] = 1000;
    bytes32 structHash = keccak256(abi.encode(KEY_TYPE_HASH, person, signkey));
    bytes32 digest = keccak256(abi.encodePacked(uint16(0x1901), structHash));
    address trader = ecrecover(digest, v, r, s);
    require(trader == person, "invalid");
    emit Deposit(msg.sender, amount);
    }

    function getBalance(address user) public view returns (uint256) {
        return deposits[user];
    }

}


