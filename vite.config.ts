import path from "path";
import {ConfigEnv, defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({command, mode}: ConfigEnv) => {
  console.log(`configuring vite with command: ${command}, mode: ${mode}`);
  // suppress eslint warning that process isn't defined (it is)
  // eslint-disable-next-line
  const cwd = process.cwd();
  console.log(`loading envs from ${cwd} ...`);
  const env = {...loadEnv(mode, cwd, "VITE_")};

  // reusable config for both server and preview
  const serverConfig = {
    host: true,
    port: Number(env.VITE_PORT),
    strictPort: true,
  };

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: "/",
    plugins: [react()],
    preview: {...serverConfig, allowedHosts: ["cms-pertamina.192-168-100-100.xyz"]},
    server: serverConfig,
  };
});
