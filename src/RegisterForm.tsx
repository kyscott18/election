import React, { useState } from "react";
import { Button, Form } from "semantic-ui-react";
import { register } from "./api/election";
import useAsync from "./components/useAsync";
import Web3 from "web3";
import { useWeb3Context } from "./contexts/Web3";

interface Props {} 

interface RegisterParams {
    web3: Web3;
    account: string;
    name: string;
}

const RegisterForm: React.FC<Props> = () => {
    const {
        state: { web3, account },
        } = useWeb3Context();

    const [name, setName] = useState("");
    const {pending, call} = useAsync<RegisterParams, void>(
        ({web3, account, name}) => register(web3, account, { name })
    );

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        setName(e.target.value);
    }

    async function onSubmit(_e: React.FormEvent<HTMLFormElement>) {
        if (pending) {
          return;
        }
    
        if (!web3) {
          alert("No web3");
          return;
        }
    
        const { error } = await call({
            web3,
            account,
            name,
          });

        if (error) {
        alert(`Error: ${error.message}`);
        } else {
        setName("");
        }
      }

    return (
        <Form onSubmit={onSubmit}>
          <Form.Field>
            <Form.Input
              placeholder="Enter your name"
              type="string"
              value={name}
              onChange={onChange}
            />
          </Form.Field>
          <Button color="green" disabled={pending} loading={pending}>
            Register as a Candidate
          </Button>
        </Form>
      );
    };
    
    export default RegisterForm;