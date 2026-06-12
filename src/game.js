(function () {
  const WIDTH = 540;
  const HEIGHT = 960;

  function startGame() {
    const config = {
      type: Phaser.AUTO,
      parent: "game-root",
      width: WIDTH,
      height: HEIGHT,
      backgroundColor: "#80e8d8",
      pixelArt: false,
      roundPixels: false,
      render: {
        antialias: true,
        powerPreference: "high-performance"
      },
      input: {
        activePointers: 3
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: WIDTH,
        height: HEIGHT
      },
      scene: [
        window.StarDashScenes.PreloadScene,
        window.StarDashScenes.MenuScene,
        window.StarDashScenes.PlayScene
      ]
    };

    window.starDashGame = new Phaser.Game(config);
  }

  window.addEventListener("load", async () => {
    if (document.fonts) {
      await Promise.allSettled([
        document.fonts.load('800 42px "Baloo 2"'),
        document.fonts.load('900 42px "Nunito"')
      ]);
    }

    if (!window.Phaser || !window.StarDashScenes) {
      const root = document.getElementById("game-root");
      root.textContent = "Game files did not load.";
      return;
    }

    startGame();
  });
})();
