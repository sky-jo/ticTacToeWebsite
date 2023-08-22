import StateTree
import sys
import json
import ast

def convert_board(board):
    '''
    board is a 1d array with nine elements representing a tic tac toe board
    returns a 2d array representing the same tic tac toe board for use with
    State and StateTree classes
    '''
    row = 0
    col = 0
    retVal = [[" ", " ", " "], # 0
              [" ", " ", " "], # 1
              [" ", " ", " "]] # 2
    for char in board:
        if col == 3:
            row += 1
            col = 0
        retVal[row][col] = char
        col += 1
    return retVal

def get_move(board):
    board = convert_board(board)
    p1 = StateTree.Player("X", "Human")
    p2 = StateTree.Player("O", "Computer")

    current_state = StateTree.State(board, p1, p2, p2)
    st = StateTree.StateTree(current_state)
    value, output = st.getBestMove()
    # output is the computer generated move
    print(json.dumps(output))
    sys.stdout.flush()

get_move(ast.literal_eval(sys.argv[1]))

