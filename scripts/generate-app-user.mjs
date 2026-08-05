import { pbkdf2Sync, randomBytes } from "node:crypto";

const ITERATIONS = 210_000;

function readArgument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1]?.trim() : undefined;
}

function readHidden(prompt) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error("Este comando necesita una terminal interactiva.");
  }

  return new Promise((resolve, reject) => {
    let value = "";
    const previousRawMode = process.stdin.isRaw;

    function finish(error) {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(Boolean(previousRawMode));
      process.stdin.pause();
      process.stdout.write("\n");

      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    }

    function onData(chunk) {
      for (const character of String(chunk)) {
        if (character === "\u0003") {
          finish(new Error("Operacion cancelada."));
          return;
        }

        if (character === "\r" || character === "\n") {
          finish();
          return;
        }

        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
          continue;
        }

        value += character;
      }
    }

    process.stdout.write(prompt);
    process.stdin.setEncoding("utf8");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

const email = readArgument("email")?.toLowerCase();
const name = readArgument("name");

if (!email || !email.includes("@") || !name) {
  console.error(
    'Uso: npm run generate:app-user -- --email "correo@empresa.com" --name "Nombre"',
  );
  process.exit(1);
}

const password = await readHidden("Clave productiva: ");
const confirmation = await readHidden("Repite la clave: ");

if (password !== confirmation) {
  throw new Error("Las claves no coinciden.");
}

if (password.length < 12) {
  throw new Error("La clave debe tener al menos 12 caracteres.");
}

const salt = randomBytes(16);
const passwordHash = pbkdf2Sync(
  password,
  salt,
  ITERATIONS,
  32,
  "sha256",
);
const user = {
  email,
  name,
  salt: salt.toString("base64"),
  passwordHash: passwordHash.toString("base64"),
  iterations: ITERATIONS,
};

console.log("\nAPP_USERS_JSON para un usuario:\n");
console.log(JSON.stringify([user]));
console.log(
  "\nPara varios usuarios, genera cada objeto y reunelos dentro del mismo arreglo JSON.",
);
