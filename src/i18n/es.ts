export const es = {
    common: {
        error: 'Error',
        success: 'Éxito',
        processing: 'Procesando',
        ready: 'Listo',
    },
    lang: {
        name: 'Idioma',
        description: 'Establece tu idioma preferido',
        success: 'Idioma Cambiado',
        changed: 'Tu idioma ha sido cambiado a {language}',
        en: 'Inglés',
        es: 'Español'
    },
    imgtogif: {
        name: 'Imagen a GIF',
        invalidInteraction: 'Tipo de interacción inválida',
        noImage: 'No se encontró ninguna imagen en el mensaje',
        processing: 'Convirtiendo tu imagen a GIF...',
        noImageProvided: 'No se proporcionó ninguna imagen',
        imageTooLarge: 'La imagen es demasiado grande. El límite es de 8MB',
        unsupportedFormat: 'Formato de imagen no soportado',
        conversionError: 'Error al convertir la imagen a GIF',
        success: 'Aquí tienes tu GIF',
        errorSending: 'Error al enviar el GIF a Discord',
        unknownError: 'Error desconocido al procesar la imagen'
    },
    imgtogifwithbubble: {
        name: 'Imagen a GIF con Burbuja',
        invalidInteraction: 'Tipo de interacción inválido.',
        noImage: 'No se encontró ninguna imagen en el mensaje.',
        processing: 'Añadiendo burbuja y convirtiendo a GIF...',
        noImageProvided: 'No se proporcionó ninguna imagen.',
        imageTooLarge: 'La imagen es demasiado grande. El tamaño máximo es de 8MB.',
        unsupportedFormat: 'Formato de imagen no soportado',
        conversionError: 'Error al convertir la imagen a GIF con burbuja',
        success: '¡Aquí está tu GIF con burbuja!',
        errorSending: 'Error al enviar el GIF.',
        unknownError: 'Ocurrió un error desconocido.'
    },
    imagetogifwithtext: {
        name: 'Imagen a GIF con Texto',
        invalidInteraction: 'Tipo de interacción inválido.',
        noImage: 'No se encontró ninguna imagen en el mensaje.',
        processing: 'Añadiendo texto y convirtiendo a GIF...',
        noImageProvided: 'No se proporcionó ninguna imagen.',
        imageTooLarge: 'La imagen es demasiado grande. El tamaño máximo es de 8MB.',
        unsupportedFormat: 'Formato de imagen no soportado',
        conversionError: 'Error al convertir la imagen a GIF con texto',
        success: '¡Aquí está tu GIF con texto!',
        errorSending: 'Error al enviar el GIF.',
        unknownError: 'Ocurrió un error desconocido.',
        modalTitle: 'Añadir Texto al GIF',
        textInputLabel: 'Texto a añadir',
        textInputPlaceholder: 'Introduce el texto que quieres añadir a la imagen',
        noChannel: 'No se pudo encontrar el canal donde se publicó la imagen.',
        errorFetchingMessages: 'Error al obtener los mensajes del canal.'
    },
    linkedin: {
        name: 'LinkedIn',
        description: 'Muestra un mensaje gracioso sobre LinkedIn',
        title: '¿Aburrido en el trabajo, eh?',
        message: "¡Ah, veo que estás aquí en Discord durante horas de trabajo! ¿Sin vida social? ¿O es tu gato tu único amigo?\n\n" +
                "Ya que estás aquí perdiendo el tiempo, ¿por qué no buscas trabajo en LinkedIn?\n\n" +
                "Seamos honestos:\n" +
                "- Tu madre está cansada de verte en el sofá\n" +
                "- Tu cuenta bancaria llora en silencio\n" +
                "- Hasta tu almohada te juzga por dormir tanto\n\n" +
                "**¡MUEVE TU TRASERO A LINKEDIN Y HAZ ALGO PRODUCTIVO!**\n" +
                "_(Este mensaje fue patrocinado por tu conciencia)_",
        footer: "Sal de Discord y ve a buscar trabajo, vago",
        buttonLabel: "Ir a LinkedIn"
    },
    debug: {
        name: 'Debug',
        description: 'Comandos de depuración para pruebas',
        normalMessage: 'Este es un mensaje de texto normal',
        ephemeralMessage: 'Este es un mensaje efímero (solo tú puedes verlo)',
        buttonMessage: 'Este mensaje tiene botones',
        buttonClicked: '¡Botón pulsado!',
        ping: 'Ping',
        pong: 'Pong! ',
        ephemeral: 'Efímero',
        button: 'Botón'
    },
    tictactoe: {
        name: 'Tres en Raya',
        description: 'Inicia una partida de tres en raya',
        opponent: 'El jugador al que quieres desafiar',
        newGame: 'Nueva Partida',
        challenged: '{user}, has sido retado a una partida de Tres en Raya por {challenger}.\n¿Aceptas el desafío?',
        accept: 'Aceptar',
        reject: 'Rechazar',
        surrender: 'Rendirse',
        gameStarted: '¡Partida Iniciada!',
        gameAccepted: '¡El desafío ha sido aceptado! Comienza el juego.',
        gameRejected: 'Desafío Rechazado',
        rejected: '{user} ha rechazado el desafío.',
        gameOver: '¡Fin de la Partida!',
        draw: '¡Empate!',
        winner: '¡{winner} ha ganado la partida!',
        surrendered: '{user} se ha rendido.\n¡{winner} es el ganador! 🎉',
        gameInProgress: 'Partida en Curso',
        goodMove: '¡Buen movimiento! Es el turno de {player}',
        waiting: 'Esperando...',
        currentTurn: 'Turno Actual',
        playerX: 'Jugador X',
        playerO: 'Jugador O',
        selfChallenge: 'No puedes jugar contra ti mismo.',
        notInGame: 'No estás en esta partida.',
        notYourTurn: 'No es tu turno.',
        invalidMove: 'Movimiento inválido.',
        gameNotFound: 'No se encontró la partida.'
    }
};
