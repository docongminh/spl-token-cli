# spl-token-cli
SPL token CLI (NFT, Fungible Asset, Fungible Token)

## Work flow create metadata (currently for Fungible Token)

  - Step 1: Create metadata based on [`Token Standard`](https://docs.metaplex.com/token-metadata/specification#token-standards)
    
    Example metdata
    ```json
      {
        "name": "NEKO Coin",
        "symbol": "NKC",
        "description": "Test build neko token",
        "image": "https://cdn.discordapp.com/attachments/953573404395585596/960393815208914964/Group_7996_1.png",
        "external_url": "https://github.com/docongminh",
        "seller_fee_basis_points": 0
      }
    ```
  - Step 2: Upload metadata to storage (currently `nft-storage`)
    
    ```bash
      ts-node ./src/upload-cli.ts upload-metadata-to-storage --help
    ```
    ```
      Usage: upload-cli upload-metadata-to-storage [options]

      Options:
        -e, --env <string>           Solana cluster env name (default: "devnet")
        -k, --keypair <path>         Solana wallet location
        -l, --log-level <string>     log level
        -f, --file <string>          metadata json file
        -s, --storage <string>       storage type
        -r, --rpc-url <string>       Optional: Custom RPC url
        --nft-storage-key <string>   Optional: NFT storage key
        --ipfs-credentials <string>  Optional: IPFS credentials
        --pinata-jwt <string>        Optional: Pinata JWT
        --pinata-gateway <string>    Optional: Pinata Gateway
        --aws-s3-bucket <string>     Optional: AWS S3 Bucket
        -h, --help                   display help for command
    ```
    Command: 
    ```bash
      ts-node ./src/upload-cli.ts upload-metadata-to-storage -f ./path/to/metadata.json -k /path/to/keypair -e devnet -s nft-storage
    ```
    
    Output:
    ```json
      {
        "link": "https://bafkreig2txa2sx7eg5vb4mixnfuyjdsttt4spxdo3emcrptgjztrjxtdxu.ipfs.dweb.link",
        "imageLink": "https://cdn.discordapp.com/attachments/953573404395585596/960393815208914964/Group_7996_1.png",
        "animationLink": "undefined"
      }
    ```
  - Step 3: Create metdata for specify token
    ```bash
      ts-node ./src/create-cli.ts create-metadata --help
    ```
    ```
      Usage: create-cli create-metadata [options]

      Options:
        -e, --env <string>          Solana cluster env name (default: "devnet")
        -k, --keypair <path>        Solana wallet location (default: "--keypair not provided")
        -l, --log-level <string>    log level
        -m, --mint <string>         base58 mint key
        -u, --uri <string>          metadata uri
        -f, --file <string>         local file
        -nvc, --no-verify-creators  Optional: Disable Verification of Creators
        -h, --help                  display help for command
    ```   
    
    Command: 
    ```bash
      ts-node ./src/create-cli.ts create-metadata -u /link/metadata/step 2 -e devnet -k /path/to/keypair -m /mint/address
    ```
    Output: 
    ```json
      {
        "txid": "5J7j8U6PdX2VUNsAAeYyvj9Ck1WoLsEEgUcDWYCMmv29vTkjiNzAhXLD5Zperz7B7JnRnRCqoSoMC5zJuCTCru2j",
        "slot": 127916616
      }
    ```
