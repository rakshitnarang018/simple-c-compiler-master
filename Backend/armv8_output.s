.global _start
.section .text
_start:

print_int:
    MOV x2, x1
    MOV x3, #10
    ADR x4, int_buf+20
    MOV x5, #0
print_loop:
    UDIV x6, x2, x3
    MUL x7, x6, x3
    SUB x8, x2, x7
    ADD x8, x8, #'0'
    SUB x4, x4, #1
    STRB w8, [x4]
    MOV x2, x6
    ADD x5, x5, #1
    CBNZ x6, print_loop
    MOV x0, #1
    MOV x1, x4
    MOV x2, x5
    MOV x8, #64
    SVC #0
    RET

.section .bss
int_buf: .skip 20
