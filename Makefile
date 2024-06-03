# Set src/out directory and compiler flags
DEPLOY:=target/deploy

# Define the target
TARGET:=$(DEPLOY)/sbpf_inline_asm.so

# Prepare for deploy
deploy:
	@if [ ! -f $(DEPLOY)/sbpf_inline_asm-keypair.json ]; then \
		echo "sbpf_inline_asm-keypair.json does not exist. Creating..."; \
		solana-keygen new --no-bip39-passphrase --outfile $(DEPLOY)/fib_keypair.json; \
	fi

# Deploy rule can be run separately
.PHONY: deploy