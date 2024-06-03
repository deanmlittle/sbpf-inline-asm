import 'rpc-websockets/dist/lib/client';
import { ComputeBudgetProgram, Connection, Keypair, Transaction, TransactionInstruction, TransactionInstructionCtorFields } from "@solana/web3.js"
const signerSeed = JSON.parse(process.env.SIGNER)
import programSeed from "../target/deploy/sbpf_inline_asm-keypair.json"
import { assert } from 'chai';
const programKeypair = Keypair.fromSecretKey(new Uint8Array(programSeed))

const program = programKeypair.publicKey

const connection = new Connection("http://127.0.0.1:8899", {
    commitment: "confirmed"
})

const signer = Keypair.fromSecretKey(new Uint8Array(signerSeed))

console.log(signer.publicKey.toBase58());

const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash()
    await connection.confirmTransaction({
        signature,
        ...block,
    })
    return signature
}

const getLogs = async (signature: string): Promise<string[]> => {
    const block = await connection.getLatestBlockhash()
    const tx = await connection.getTransaction(
        signature,
        { commitment: "confirmed" }
    )
    return tx!.meta!.logMessages || []
}

const signAndSend = async(tx: Transaction): Promise<string> => {
    const block = await connection.getLatestBlockhash()
    tx.recentBlockhash = block.blockhash
    tx.lastValidBlockHeight = block.lastValidBlockHeight
    const signature = await connection.sendTransaction(tx, [signer], { skipPreflight: true })
    return signature
}

const testTx = (): Transaction => {
    const tx = new Transaction()
    tx.instructions.push(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
        new TransactionInstruction({
        keys: [{
            pubkey: signer.publicKey,
            isSigner: true,
            isWritable: true
        }],
        programId: program,
        data: Buffer.from([])
    } as TransactionInstructionCtorFields))
    return tx
}

describe('Inline ASM Test', () => {
    it('Test our program', async () => {
        const logs = await signAndSend(testTx()).then(confirm).then(getLogs);
        assert.equal(logs[3], "Program log: This is a custom error!")
    });
});