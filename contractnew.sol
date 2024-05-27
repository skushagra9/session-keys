// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VerifySignature {
    struct Order {
        address maker;
    }
//,uint256 limitPrice,uint256 amount,uint256 salt,uint256 instrument,uint256 timestamp
    string constant public DOMAIN_NAME = "Aevo Mainnet";
    string constant public DOMAIN_VERSION = "1";
    uint256 constant public DOMAIN_CHAIN_ID = 1;

    bytes32 constant public ORDER_TYPEHASH = keccak256(
        "Order(address maker)"
    );

    bytes32 constant public DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId)"
    );

    bytes32 public DOMAIN_SEPARATOR;

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes(DOMAIN_NAME)),
                keccak256(bytes(DOMAIN_VERSION)),
                DOMAIN_CHAIN_ID
            )
        );
    }
    // need to add address

    function getOrderHash(Order memory order) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                ORDER_TYPEHASH,
                order.maker
            )
        );
    }

    function getTypedDataHash(Order memory order) public view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                getOrderHash(order)
            )
        );
    }

    function verifySignature(
        address signer,
        Order memory order,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 digest = getTypedDataHash(order);
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        return ecrecover(digest, v, r, s) == signer;
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65, "invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}

// //Account Signature: 0x08945837b1f179384aaca779430609f26b0c141a3ce67e60a4fdf2b80527065503f8291baadfaea9de8cd66c0dbc5065398cff67e94b9d398ec82c363a17eb6e1c

//0x04aCcaBEa3BEd9BBc13748e70040A5A1430Ecd5f,   [     0x04aCcaBEa3BEd9BBc13748e70040A5A1430Ecd5f   ], 0x7e6a22d869424597edc790580e0267cdd9a9fab2b5fa8dc6e17cdff210023ebe3126523f511ec03b5b525f635b449b1c2ffdd66e9f82d1b7aba4b9ac713dbd171b
