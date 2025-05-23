.global _start
.section .text
_start:
MOV x0, #10008
MOV x1, x0
MOV x2, #4
SUB x19, x1, x2
MOV x4, #35
STR x4, [x19]
B LABEL_4
LABEL_4:
MOV x91, #0
MOV x93, #1
MOV x1, x91
MOV x2, x93
SUB x6, x1, x2
MOV x7, x6
MOV x94, #1
MOV x87, x94
MOV x95, #1
MOV x79, x95
MOV x96, #50
MOV x88, x96
LABEL_14:
MOV x97, #2
MOV x1, x97
MOV x2, x88
MUL x10, x1, x2
MOV x98, #1
MOV x1, x10
MOV x2, x98
ADD x9, x1, x2
MOV x1, x79
MOV x2, x9
CMP x1, x2
CSET x13, LT
MOV x90, x13
CMP x90, #0
BEQ LABEL_32
MOV x1, x87
MOV x2, x7
MUL x12, x1, x2
MOV x87, x12
MOV x99, #0
MOV x1, x87
MOV x2, x99
CMP x1, x2
CSET x14, LT
MOV x90, x14
CMP x90, #0
BEQ LABEL_26
B LABEL_28
LABEL_26:
MOV x83, x79
MOV x84, x83
MOV x0, #1
MOV x1, x84
BL print_int
LABEL_28:
MOV x100, #1
MOV x1, x79
MOV x2, x100
ADD x15, x1, x2
MOV x79, x15
B LABEL_14
LABEL_32:
MOV x1, x0
MOV x2, #4
SUB x16, x1, x2
LDR x89, [x16]
LDR x17, [x89]
BR x17

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
