# SSH Connection (sshConnection)

Connect to remote servers via SSH and execute shell commands from FastGPT workflows.

## Authentication Methods

- Password authentication: configure `host`, `port`, `username`, `password`
- Private key authentication: configure `host`, `port`, `username`, `privateKey`
- Encrypted private key: configure `passphrase` in addition to private key settings

## Inputs

- `command`: Remote shell command to execute
- `cwd`: Optional working directory to switch to before execution
- `timeout`: Optional command execution timeout in milliseconds (default 30,000ms, max 300,000ms)
- `connectionTimeout`: Optional connection establishment timeout in milliseconds (default 10,000ms, max 60,000ms)

## Outputs

- `stdout`: Standard output text
- `stderr`: Standard error output text
- `exitCode`: Process exit status code
- `signal`: Termination signal if terminated prematurely
- `durationMs`: Execution duration in milliseconds
