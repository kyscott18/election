import Web3 from "web3";
import React, {
    useReducer, 
    useEffect, 
    createContext, 
    useContext, 
    useMemo,
} from "react";
import { useWeb3Context } from "./Web3";
import { get as getElection, subscribe } from "../api/election";

interface State {
    address: string,
    voteCount: number; 
    candidateCount: number;
    candidates: Candidate[];
}

interface Candidate {
    owner: string;
    id: number;
    name: string;
    numVotes: number;
}

const INITIAL_STATE: State = {
    address: "",
    voteCount: 0, 
    candidateCount: 0, 
    candidates: [],
};

const SET = "SET";
const VOTE = "VOTE"; 
const REGISTER = "REGISTER";

interface Set {
    type: "SET";
    data: {
        address: string;
        voteCount: number; 
        candidateCount: number;
        candidates: Candidate[];
    }
}

interface Vote {
    type: "VOTE";
    data : {
        id: number;
    }
}

interface Register {
    type: "REGISTER";
    data: {
        owner: string;
        id: number;
        name: string;
    }
}

type Action = Set | Vote | Register;

function reducer(state: State = INITIAL_STATE, action: Action) {
    switch (action.type) {
        case SET: {
            return {
                ...state, 
                ...action.data,
            };
        }

        case REGISTER: {
            const {
                data: { owner, id, name},
            } = action;
            const candidates = [
                {
                    owner: owner,
                    id: id, 
                    name: name, 
                    voteCount: 0,
                }, 
                ...state.candidates,
            ];

            return {
                ...state, 
                candidateCount: state.candidateCount + 1,
                candidates,
            };
        }

        default:
            return state;
    }
}

interface SetInputs {
    address: string;
    voteCount: number; 
    candidateCount: number;
    candidates: Candidate[];
}

interface VoteInputs {
    id: number;
}

interface RegisterInputs {
    owner: string;
    id: number;
    name: string;
}

const ElectionContext = createContext({
    state: INITIAL_STATE,
    set: (_data: SetInputs) => {},
    vote: (_data: VoteInputs) => {},
    register: (_data: RegisterInputs) => {},
});

export function useElectionContext() {
    return useContext(ElectionContext);
}

interface ProviderProps {}

export const Provider: React.FC<ProviderProps> = ({ children }) => {
    // @ts-ignore
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

    function set(data: SetInputs) {
        // @ts-ignore
        dispatch({ 
            type: SET,
            data,
        });
    }

    function vote(data: VoteInputs) {
        // @ts-ignore
        dispatch({
            type: VOTE,
            data,
        });
    }

    function register(data: RegisterInputs) {
        // @ts-ignore
        dispatch({
            type: REGISTER,
            data,
        })
    }

    return (
        <ElectionContext.Provider
            value={useMemo(
                () => ({
                    state,
                    set, 
                    vote, 
                    register,
                }),
                [state]
            )}
            >
                {children}
            </ElectionContext.Provider>
    );
};

export function Updater() {
    const {
        state: { web3, account }, 
    } = useWeb3Context();

    const { state, set, register } = useElectionContext();

    useEffect(() => {
        async function get(web3: Web3, account:string) {
            try {
                const data = await getElection(web3, account); 
                set(data);
            } catch (error) {
                console.error(error);
            }
        }

        if (web3) {
            get(web3, account);
        }

    }, [web3]);

    useEffect(() => {
        if (web3 && state.address) {
            return subscribe(web3, state.address, (error, log) => {
                if (error) {
                    console.error(error);
                } else if (log) {
                    switch (log.event) {
                        case "Register":
                        register(log.returnValues);
                        break;
                    default:
                        console.log(log);
                    }
                }
            });
        }
    }, [web3, state.address]);

    return null;
}
