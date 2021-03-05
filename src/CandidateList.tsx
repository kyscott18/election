import React from "react";
import { Button } from "semantic-ui-react";

interface Candidate {
    owner: string;
    id: number;
    name: string;
    numVotes: number;
}

interface Props {
    count: number;
    data: Candidate[];
}

const CandidateList: React.FC<Props> = ({
    count, data
}) => {
    // const {
    //     state: { web3, account },
    // } = useWeb3Context; 


    // const vote = useAsync(async () => {
    //     if (!web3) {
    //         throw new Error("No web3");
    //     }
    //     await elect.vote(web3, account, { 0 });
    // });
    // }
    return (
        <ul>
            {data.map(c => (
                <li key = {c.id}>
                    <div>Candidate Address: {c.owner}</div>
                    <div>Candidate ID: {c.id}</div>
                    <div>Candidate Name: {c.name}</div>
                    <div>Candidate Vote Count: {c.numVotes}</div>
                    <Button 
                    >
                        Vote
                    </Button>
                </li>
            ))}
        </ul>
    );
};

export default CandidateList;