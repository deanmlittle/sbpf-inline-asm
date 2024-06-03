#![cfg_attr(target_os="solana", feature(asm_experimental_arch))]
use core::arch::asm;

pub static ERROR_1: &str = "This is a custom error!";

#[no_mangle]
pub extern "C" fn entrypoint() {
    custom_error(ERROR_1, 1)
}

pub extern "C" fn sol_log_() {}

pub extern "C" fn custom_error(msg: &str, code: u64) {
    unsafe {
        asm!("
            mov64 r1, {}
            mov64 r2, {}
            call sol_log_
            mov64 r0, {} // This is how we set an error code
            exit
        ", 
        in(reg) msg.as_ptr(),
        in(reg) msg.len(),
        in(reg) code)
    }
}