"use client"

import { Input, Button, useDisclosure } from "@chakra-ui/react"
import { useState } from "react"
import { AiOutlineInfoCircle } from "react-icons/ai"
import Layout from "@/components/Layout"
import factoryabi from "../../pages/utils/factory.json"
import childAbi from "../../pages/utils/childAccount.json"
import { useEffect } from "react"
import { useContractRead, useAccount, useContractWrite, usePrepareContractWrite } from "wagmi"
const ethUtil = require("ethereumjs-util")
const abi = require("ethereumjs-abi")
import Web3 from "web3"
import TransferModal from "../components/TransferModal"
import RevokeModal from "../components/RevokeModal"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Loading from "../components/Loading"

const web3 = new Web3(window.ethereum) // Declare the ethereum variable here

export const Dashboard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isOpentwo, onOpen: onOpentwo, onClose: Onclosetwo } = useDisclosure()
  const [loadingState, setLoadingState] = useState(false)
  const [isSign, setIsSign] = useState(true)
  const [isMint, setIsMint] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [childContractAddr, setChildContractAddr] = useState("")
  const [signature, setSignature] = useState("")
  const { address } = useAccount()

  const handleNext = () => {
    setIsSign(false)
    setIsMint(true)
  }

  const handleWalletInput = (e) => {
    setWalletAddress(e.target.value)
  }

  const { config: MintConfig } = usePrepareContractWrite({
    address: childContractAddr,
    abi: childAbi,
    functionName: "AppendSignature",
    args: [signature, walletAddress, 1849645008],
  })
  const { data, isLoading, isSuccess, write: callMint } = useContractWrite(MintConfig)

  const handleMint = () => {
    if (walletAddress != "") {
      setLoadingState(true)
      callMint?.()
    } else {
      toast.error("Input Wallet Address")
    }
  }
  const {
    data: childAddress,
    isError,
    isLoading: isChildLoading,
    isFetched,
  } = useContractRead({
    address: "0x504195e2a73A2Cd0f3c691e49ADC93E509cFdA79",
    abi: factoryabi,
    functionName: "SingleAccount",
    args: [address],
  })

  const {
    data: childContractData,
    isError: childerror,
    isLoading: childLoading,
    isFetched: childFetched,
  } = useContractRead({
    address: childContractAddr,
    abi: childAbi,
    functionName: "Institution",
  })

  const {
    data: childContractID,
    isError: nonceerror,
    isLoading: nonceLoading,
    isFetched: NonceFetched,
  } = useContractRead({
    address: childContractAddr,
    abi: childAbi,
    functionName: "id",
  })

  const {
    data: childContractNonce,
    isError: IDerror,
    isLoading: IDLoading,
    isFetched: IDFetched,
  } = useContractRead({
    address: childContractAddr,
    abi: childAbi,
    functionName: "nonce",
  })

  useEffect(() => {
    if (isFetched) {
      setChildContractAddr(childAddress)
    }
    if (childFetched) {
      console.log(childContractData)
    }
    if (NonceFetched) {
      console.log(childContractNonce)
    }
    if (IDFetched) {
      console.log(childContractID)
    }
    if (!address) {
      window.location.href = "/"
    }
    if (isSuccess) {
      toast.info("Mint successful")
      setLoadingState(false)
    }
  }, [childAddress, childContractData, childContractNonce, childContractID, address, isSuccess])

  const typedData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      MintCert: [
        { name: "owner", type: "address" },
        { name: "recipient", type: "address" },
        { name: "certificateID", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "MintCert",
    domain: {
      name: "Educational Certificate",
      version: "1",
      chainId: 44787,
      verifyingContract: childContractAddr,
    },
    message: {
      owner: address,
      recipient: walletAddress,
      certificateID: Number(childContractID),
      nonce: Number(childContractNonce),
      deadline: 1849645008,
    },
  }

  const types = typedData.types

  // Recursively finds all the dependencies of a type
  function dependencies(primaryType, found = []) {
    if (found.includes(primaryType)) {
      return found
    }
    if (types[primaryType] === undefined) {
      return found
    }
    found.push(primaryType)
    for (const field of types[primaryType]) {
      for (const dep of dependencies(field.type, found)) {
        if (!found.includes(dep)) {
          found.push(dep)
        }
      }
    }
    return found
  }

  function encodeType(primaryType) {
    // Get dependencies primary first, then alphabetical
    let deps = dependencies(primaryType)
    deps = deps.filter((t) => t != primaryType)
    deps = [primaryType].concat(deps.sort())

    // Format as a string with fields
    let result = ""
    for (const type of deps) {
      result += `${type}(${types[type].map(({ name, type }) => `${type} ${name}`).join(",")})`
    }
    return result
  }

  function typeHash(primaryType) {
    return ethUtil.keccakFromString(encodeType(primaryType), 256)
  }

  function encodeData(primaryType, data) {
    const encTypes = []
    const encValues = []

    // Add typehash
    encTypes.push("bytes32")
    encValues.push(typeHash(primaryType))

    // Add field contents
    for (const field of types[primaryType]) {
      let value = data[field.name]
      if (field.type == "string" || field.type == "bytes") {
        encTypes.push("bytes32")
        value = ethUtil.keccakFromString(value, 256)
        encValues.push(value)
      } else if (types[field.type] !== undefined) {
        encTypes.push("bytes32")
        value = ethUtil.keccak256(encodeData(field.type, value))
        encValues.push(value)
      } else if (field.type.lastIndexOf("]") === field.type.length - 1) {
        throw "TODO: Arrays currently unimplemented in encodeData"
      } else {
        encTypes.push(field.type)
        encValues.push(value)
      }
    }

    return abi.rawEncode(encTypes, encValues)
  }

  function structHash(primaryType, data) {
    return ethUtil.keccak256(encodeData(primaryType, data))
  }

  function signHash() {
    return ethUtil.keccak256(
      Buffer.concat([
        Buffer.from("1901", "hex"),
        structHash("EIP712Domain", typedData.domain),
        structHash(typedData.primaryType, typedData.message),
      ]),
    )
  }
  const handleSign = async () => {
    if (window.ethereum && walletAddress != "") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) // Use window.ethereum here
        const senderAddress = accounts[0]

        // Construct the EIP-712 message hash
        const messageHash = signHash()
        // Request the signature using eth_signTypedData_v4
        const signature = await window.ethereum.request({
          method: "eth_signTypedData_v4",
          params: [senderAddress, typedData],
        })
        setSignature(signature)
        console.log("Signature:", signature)
        handleNext()
      } catch (error) {
        console.error("Error:", error)
      }
    } else {
      console.error("MetaMask not detected")
    }
    if (walletAddress == "") {
      toast.error("Input Wallet Address")
    }
  }

  return (
    <>
      <Layout status={false} clicked={onOpen} secondClick={onOpentwo}>
        {loadingState && <Loading />}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Stats Header */}
          <div className="w-full max-w-6xl rounded-[10px] bg-[#FFFEFF70] mx-auto mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 px-4 sm:px-8 lg:px-[100px] py-4 sm:py-[5px]">
              <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                <h1 className="text-[12px] xs:text-[14px] sm:text-[16px] font-[500] satoshi text-[#FFFFFF]">
                  Institution Name:
                </h1>
                <p className="text-[12px] xs:text-[14px] sm:text-[16px] font-[400] satoshi text-[#FFFFFF9E] break-all">
                  {childContractData?._name || "Loading..."}
                </p>
              </div>
              <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                <h1 className="text-[12px] xs:text-[14px] sm:text-[16px] font-[500] satoshi text-[#FFFFFF]">
                  Certificates Issued:
                </h1>
                <p className="text-[12px] xs:text-[14px] sm:text-[16px] font-[400] satoshi text-[#FFFFFF9E]">
                  {Number(childContractData?.certMinted) || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full max-w-6xl rounded-[14px] bg-[#FFFFFF] mx-auto p-4 sm:p-6 lg:p-[30px] relative">
            {/* Tab Headers */}
            <div className="flex mb-6 sm:mb-8">
              <div
                className="flex-1 text-[14px] xs:text-[16px] sm:text-[18px] text-center text-[#717171] font-[400] py-2 sm:py-3 cursor-pointer transition-colors"
                style={{ borderBottom: isSign ? "4px solid #4C32C3" : "2px solid #e5e5e5" }}
                onClick={() => {
                  setIsSign(true)
                  setIsMint(false)
                }}
              >
                Sign Certificate
              </div>
              <div
                className="flex-1 text-[14px] xs:text-[16px] sm:text-[18px] text-center text-[#717171] font-[400] py-2 sm:py-3 cursor-pointer transition-colors"
                style={{ borderBottom: isMint ? "4px solid #4C32C3" : "2px solid #e5e5e5" }}
                onClick={() => {
                  setIsMint(true)
                  setIsSign(false)
                }}
              >
                Mint Certificate
              </div>
            </div>

            <TransferModal open={isOpen} close={onClose} address={childContractAddr} />
            <RevokeModal open={isOpentwo} close={Onclosetwo} address={childContractAddr} />

            {/* Sign Certificate Tab */}
            {isSign && (
              <div className="space-y-4 sm:space-y-6 w-full">
                <Input
                  type="text"
                  id="walletInput"
                  placeholder="Wallet address"
                  className="bg-[#D4D4D43B] satoshi text-[14px] sm:text-[16px] lg:text-[18px] text-black px-[15px] sm:px-[20px] w-full h-[45px] sm:h-[50px] lg:h-[56px] rounded-[12px]"
                  value={walletAddress}
                  onChange={handleWalletInput}
                />
                <Input
                  type="number"
                  id="expiry"
                  placeholder="Expiry period : 1849645008"
                  className="bg-[#D4D4D43B] satoshi text-[14px] sm:text-[16px] lg:text-[18px] text-black px-[15px] sm:px-[20px] w-full h-[45px] sm:h-[50px] lg:h-[56px] rounded-[12px]"
                  value="1849645008"
                  readOnly
                />
                <div className="flex items-start space-x-3 text-[#13042585] text-[12px] sm:text-[14px] w-full">
                  <AiOutlineInfoCircle className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Please note: The expiry period applies only before mint</p>
                </div>

                <div className="w-full flex justify-center sm:justify-end pt-8 sm:pt-12 lg:pt-16">
                  <Button
                    style={{ background: "#130425", color: "#EEEEF0" }}
                    className="w-full sm:w-auto min-w-[200px] sm:min-w-[259px] text-[14px] sm:text-[16px] lg:text-[18px] h-[40px] sm:h-[45px] lg:h-[50px] rounded-[8px] px-[20px] sm:px-[24px] py-[12px] sm:py-[16px]"
                    onClick={handleSign}
                  >
                    Sign Certificate
                  </Button>
                </div>
              </div>
            )}

            {/* Mint Certificate Tab */}
            {isMint && (
              <div className="space-y-4 sm:space-y-6 w-full">
                <div className="flex items-start space-x-3 text-[#4C32C3] text-[12px] sm:text-[14px] w-full mb-4">
                  <AiOutlineInfoCircle className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Please note: the wallet address and Expiry period credentials must match the previous screen
                  </p>
                </div>
                <Input
                  type="text"
                  id="walletInput"
                  placeholder="Wallet address"
                  className="bg-[#D4D4D43B] satoshi text-[14px] sm:text-[16px] lg:text-[18px] text-black px-[15px] sm:px-[20px] w-full h-[45px] sm:h-[50px] lg:h-[56px] rounded-[12px]"
                  value={walletAddress}
                  onChange={handleWalletInput}
                />
                <Input
                  type="text"
                  id="expiry"
                  placeholder="Expiry period : 1849645008"
                  className="bg-[#D4D4D43B] satoshi text-[14px] sm:text-[16px] lg:text-[18px] text-black px-[15px] sm:px-[20px] w-full h-[45px] sm:h-[50px] lg:h-[56px] rounded-[12px]"
                  value="1849645008"
                  readOnly
                />

                <div className="w-full flex justify-center sm:justify-end pt-8 sm:pt-12 lg:pt-16">
                  <Button
                    style={{ background: "#130425", color: "#EEEEF0" }}
                    className="w-full sm:w-auto min-w-[200px] sm:min-w-[259px] text-[14px] sm:text-[16px] lg:text-[18px] h-[40px] sm:h-[45px] lg:h-[50px] rounded-[8px] px-[20px] sm:px-[24px] py-[12px] sm:py-[16px]"
                    onClick={handleMint}
                  >
                    Mint Certificate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Layout>
    </>
  )
}
export default Dashboard
