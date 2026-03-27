#!/bin/bash
PWD=$PWD

ZSH_CUSTOM_DIR=~/.zsh-custom

os="macos"
ln_flags="-shf"

# OS Specific files
# -----------------------------------------------
if [[ $(uname) == "Linux" ]]; then
    echo "Creating links on Linux"
    os="linux"
    ln_flags="-sT"
else
    echo "Creating links on macOS"
fi

ln "$ln_flags" "$PWD/skills" "$HOME/.claude/skills"
ln "$ln_flags" "$PWD/agents" "$HOME/.claude/agents"
