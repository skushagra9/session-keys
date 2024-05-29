// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VerifyTypedData {
    /*
     * getSigner(uint256 _myValue, bytes memory _signature)
     * @param _myValue = 123
     * @param _signature = 0x5e9714b8b78cbf84bf8e53c5967b09a7f8ee895367c0b427859ab520a79702667c8b94e6a320f88977908924bd4b57e94c52efed90e2a2c5cee601e3117e84281b
     * @return 0xdD4c825203f97984e7867F11eeCc813A036089D1
     */
    function getSigner(uint256 _myValue, bytes memory _signature)
        public
        view 
        returns (address)
    {
        // EIP721 domain type
        string memory name = "Filament";
        string memory version = "1";
        uint256 chainId = 713715;
       address verifyingContract = address(this);

        // stringified types
        string memory EIP712_DOMAIN_TYPE = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";
        string memory MESSAGE_TYPE = "Message(uint256 myValue)";

        // hash to prevent signature collision
        bytes32 DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(abi.encodePacked(EIP712_DOMAIN_TYPE)),
                keccak256(abi.encodePacked(name)),
                keccak256(abi.encodePacked(version)),
                chainId,
                verifyingContract
            )
        );

        // hash typed data
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19\x01", // backslash is needed to escape the character
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        keccak256(abi.encodePacked(MESSAGE_TYPE)),
                        _myValue
                    )
                )
            )
        );

        // split signature
        bytes32 r;
        bytes32 s;
        uint8 v;
        if (_signature.length != 65) {
            return address(0);
        }
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
        if (v < 27) {
            v += 27;
        }
        if (v != 27 && v != 28) {
            return address(0);
        } else {
            // verify
            return ecrecover(hash, v, r, s);
        }
    }
}
//0x04aCcaBEa3BEd9BBc13748e70040A5A1430Ecd5f,   [     "0x04aCcaBEa3BEd9BBc13748e70040A5A1430Ecd5f"   ], 0xdf402591dc465892537e98b2a16d04af09fa550fc90140e18381248e896faace27ae5205f8324e9ea3c049616a3dc87931c059023a161a6e3395ab79e8b2ff7b1b
//0x24adfaafcdc081222d21ac79fdd8f7d6ed4a7d8870901dbf4964a1377aed573c785f96fb15fcce1998658947bae5918de9cd59fc2256d4f13e4319d6184cdca61c
