import { EnvConfig } from "../models/EnvConfig";
import { devConfig } from "./dev";
import { prodConfig } from "./prod";
import { stagingConfig } from "./staging";

type Environments = "dev" | "staging" | "prod";

const configs: Record<Environments, EnvConfig> = {
  dev: devConfig,
  staging: stagingConfig,
  prod: prodConfig,
};

export function loadConfig(): EnvConfig {
  const env = (process.env.ENV || "dev") as Environments;

  if (!configs[env]) {
    throw new Error(`Unknown environment: ${env}`);
  }
  console.log(`Loaded ${env.toLocaleLowerCase()} environment`);
  return configs[env];
}
