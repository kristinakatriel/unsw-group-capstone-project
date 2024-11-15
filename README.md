# Cardify.ai - A Forge Custom-UI Flashcard App

This project contains a Forge app that allows users to make flashcards in a flash!

## Project Directory Overview

``` (shell)
├── flashcards
│   ├── frontend
│   │   ├── build
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── public
│   │   │   └── index.html
│   │   └── src
│   │       ├── ContentByline.css
│   │       ├── ContentByline.js
│   │       ├── ContextMenu.css
│   │       ├── ContextMenu.js
│   │       ├── addFlashcardsToExistingDeck.css
│   │       ├── addFlashcardsToExistingDeck.js
│   │       ├── components
│   │       │   ├── CardSlider.css
│   │       │   ├── CardSlider.jsx
│   │       │   ├── DeckDisplay.css
│   │       │   ├── DeckDisplay.jsx
│   │       │   ├── DeckSlider.css
│   │       │   ├── DeckSlider.jsx
│   │       │   ├── DragNDrop.css
│   │       │   ├── DragNDrop.jsx
│   │       │   ├── QuizMode.css
│   │       │   ├── QuizMode.jsx
│   │       │   ├── QuizResults.css
│   │       │   ├── QuizResults.jsx
│   │       │   ├── StudyMode.css
│   │       │   └── StudyMode.jsx
│   │       ├── deckGlobalModuleCreate.css
│   │       ├── deckGlobalModuleCreate.js
│   │       ├── deckModuleEdit.js
│   │       ├── editTagGlobalModule.css
│   │       ├── flashcardContentActionModuleCreate.css
│   │       ├── flashcardContentActionModuleCreate.js
│   │       ├── flashcardGlobalModule.css
│   │       ├── flashcardGlobalModuleCreate.js
│   │       ├── flashcardGlobalModuleEdit.js
│   │       ├── globalPageModule.css
│   │       ├── globalPageModule.js
│   │       ├── index.js
│   │       ├── tagGlobalModuleCreate.css
│   │       ├── tagGlobalModuleCreate.js
│   │       ├── tagGlobalPageEdit.js
│   │       └── workings.js
│   ├── manifest.yml
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── aiResolvers.ts
│   │   ├── cardResolvers.ts
│   │   ├── deckResolvers.ts
│   │   ├── flashcards.py
│   │   ├── helpers.ts
│   │   ├── index.ts
│   │   ├── requirements.txt
│   │   ├── sessions.ts
│   │   ├── tagResolvers.ts
│   │   ├── types.ts
│   │   └── userResolvers.ts
│   ├── start_uvicorn_ngrok.sh
│   └── tsconfig.json
└── README.md
```

## Requirements (to run the code)

1. [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/)

2. Setting up [Ngrok](https://ngrok.com/) using a pre-made account:
    1. Download ngrok:
       1. For Mac-OS users:
        ``` (shell)
        brew install ngrok
        ``` 
       2. For windows users:
        ``` (shell)
        choco install ngrok 
        ``` 
       3. For linux users:
       ``` (shell)
           curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
           | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
           && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
           | sudo tee /etc/apt/sources.list.d/ngrok.list \
           && sudo apt update \
           && sudo apt install ngrok```
    2. Run this anywhere in the terminal:
        ``` (shell)
        ngrok config add-authtoken 2nHmclkN2E4BZv3fWudgOG1Wj5K_zxg5Xwc9XCRNmFTtvm5P
        ```
    3. Now, you can access it!.

## Running the Code for the first time

- Install top-level dependencies in `flashcards` directory:'

``` (shell)
npm install
```

- Install dependencies inside of the `flashcards/src` directory:

``` (shell)
npm install
```

- Install python dependencies inside of the `flashcards/frontend` directory:

``` (shell)
pip install -r requirements.txt
```

- Build app (inside of the `flashcards/frontend` directory):

``` (shell)
npm run build
```

- Deploy app by running:

``` (shell)
forge deploy --environment development
```

- Install app in a Confluence site by running:

``` (shell)
forge install 
```

> Note: remember to enter the base url of the Confluence site in the form of `https://[...].atlassian.net`.

### Notes

- First do `npm run build` and then `forge deploy --environment development` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.