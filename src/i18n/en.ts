export const en = {
    common: {
        error: 'Error',
        success: 'Success',
        processing: 'Processing',
        ready: 'Ready',
    },
    lang: {
        name: 'Language',
        description: 'Set your preferred language',
        success: 'Language Changed',
        changed: 'Your language has been set to {language}',
        en: 'English',
        es: 'Spanish'
    },
    imgtogif: {
        name: 'Image to GIF',
        invalidInteraction: 'Invalid interaction type',
        noImage: 'No image found in the message',
        processing: 'Converting your image to GIF...',
        noImageProvided: 'No image provided',
        imageTooLarge: 'Image is too large. Limit is 8MB',
        unsupportedFormat: 'Unsupported image format',
        conversionError: 'Error converting image to GIF',
        success: 'Here is your GIF',
        errorSending: 'Error sending GIF to Discord',
        unknownError: 'Unknown error processing image'
    },
    imgtogifwithbubble: {
        name: 'Image to GIF with Bubble',
        invalidInteraction: 'Invalid interaction type.',
        noImage: 'No image found in the message.',
        processing: 'Converting your image to GIF with text bubble...',
        noImageProvided: 'No image was provided.',
        imageTooLarge: 'Image is too large. Maximum size is 8MB.',
        unsupportedFormat: 'Unsupported image format',
        conversionError: 'Error converting image to GIF with bubble',
        success: 'Here\'s your GIF with bubble!',
        errorSending: 'Error sending the GIF.',
        unknownError: 'An unknown error occurred.'
    },
    imagetogifwithtext: {
        name: 'Image to GIF with Text',
        invalidInteraction: 'Invalid interaction type.',
        noImage: 'No image found in the message.',
        noImageProvided: 'No image was provided.',
        imageTooLarge: 'Image is too large. Maximum size is 8MB.',
        processing: 'Adding text and converting to GIF...',
        success: 'Here\'s your GIF with text!',
        errorSending: 'Error sending the GIF.',
        unknownError: 'An unknown error occurred.',
        modalTitle: 'Add Text to GIF',
        textInputLabel: 'Text to add',
        textInputPlaceholder: 'Enter the text you want to add to the image',
        noChannel: 'Could not find the channel where the image was posted.',
        errorFetchingMessages: 'Error fetching messages from the channel.'
    },
    linkedin: {
        name: 'LinkedIn',
        description: 'Shows a funny message about LinkedIn',
        title: 'Bored at work, huh?',
        message: "Ah, I see you're here on Discord during work hours! No social life? Or is your cat your only friend?\n\n" +
                "Since you're here wasting time, why not look for a job on LinkedIn?\n\n" +
                "Let's be honest:\n" +
                "- Your mom is tired of seeing you on the couch\n" +
                "- Your bank account silently weeps\n" +
                "- Even your pillow judges you for sleeping so much\n\n" +
                "**GET YOUR BUTT TO LINKEDIN AND DO SOMETHING PRODUCTIVE!**\n" +
                "_(This message was sponsored by your conscience)_",
        footer: "Get off Discord and go job hunting, you lazy bum",
        buttonLabel: "Go to LinkedIn"
    },
    debug: {
        name: 'Debug',
        description: 'Debug commands for testing',
        normalMessage: 'This is a normal text message',
        ephemeralMessage: 'This is an ephemeral message (only you can see it)',
        buttonMessage: 'This message has buttons',
        buttonClicked: 'Button clicked!',
        ping: 'Ping',
        pong: 'Pong! ',
        ephemeral: 'Ephemeral',
        button: 'Button'
    },
    tictactoe: {
        name: 'Tic Tac Toe',
        description: 'Start a game of Tic Tac Toe',
        opponent: 'The player you want to challenge',
        newGame: 'New Game',
        challenged: '{user}, you have been challenged to a game of Tic Tac Toe by {challenger}.\nDo you accept?',
        accept: 'Accept',
        reject: 'Reject',
        surrender: 'Surrender',
        gameStarted: 'Game Started!',
        gameAccepted: 'The challenge has been accepted! Game starts now.',
        gameRejected: 'Challenge Rejected',
        rejected: '{user} has rejected the challenge.',
        gameOver: 'Game Over!',
        draw: "It's a draw!",
        winner: '{winner} has won the game!',
        surrendered: '{user} has surrendered.\n{winner} wins! ',
        gameInProgress: 'Game in Progress',
        goodMove: "Good move! It's {player}'s turn",
        waiting: 'Waiting...',
        currentTurn: 'Current Turn',
        playerX: 'Player X',
        playerO: 'Player O',
        selfChallenge: 'You cannot challenge yourself.',
        notInGame: 'You are not in this game.',
        notYourTurn: "It's not your turn.",
        invalidMove: 'Invalid move.',
        gameNotFound: 'Game not found.'
    }
};
