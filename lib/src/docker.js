"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Docker = void 0;
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const file_command_1 = require("@actions/core/lib/file-command");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const exec = __importStar(require("@actions/exec"));
class Docker {
    login(username, password, loginServer) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://github.com/Azure/docker-login/blob/master/src/login.ts
            let config = {
                auths: {
                    [`https://${loginServer}`]: {
                        auth: Buffer.from(`${username}:${password}`).toString("base64")
                    }
                }
            };
            const runnerTempDirectory = process.env.RUNNER_TEMP;
            const dirPath = path.join(runnerTempDirectory, `docker_login_${Date.now()}`);
            yield io.mkdirP(dirPath);
            const dockerConfigPath = path.join(dirPath, `config.json`);
            core.debug(`Writing docker config contents to ${dockerConfigPath}`);
            fs.writeFileSync(dockerConfigPath, JSON.stringify(config));
            file_command_1.issueCommand("ENV", `DOCKER_CONFIG=${dirPath}`);
            return {
                dockerConfigFile: dirPath,
                name: loginServer
            };
        });
    }
    createBuildContext(registry, name, tags, dockerSeedTags, buildContext = ".", dockerFile = "Dockerfile") {
        let imageNames = [];
        for (let tag of tags) {
            let imageName = `${registry.name}/${name}:${tag}`;
            imageNames.push(imageName);
        }
        let seedImageNames = [];
        for (let seedTag of dockerSeedTags) {
            let imageName = `${registry.name}/${name}:${seedTag}`;
            seedImageNames.push(imageName);
        }
        return {
            buildContext,
            dockerFile,
            imageNames,
            seedImageNames,
            registry,
        };
    }
    build(context, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let cacheFrom = context.seedImageNames
                .reduce((current, next) => {
                current.push("--cache-from", next);
                return current;
            }, []);
            for (let imageName of context.imageNames) {
                yield exec.exec("docker", [
                    "build",
                    `--tag`,
                    imageName,
                    ...options,
                    ...cacheFrom,
                    ...["--build-arg", "BUILDKIT_INLINE_CACHE=1"],
                    context.buildContext
                ]);
            }
            return {
                imageNames: context.imageNames,
                registry: context.registry
            };
        });
    }
    publish(images, options = []) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let image of images.imageNames) {
                yield exec.exec("docker", [
                    "push",
                    image,
                    ...options
                ], {
                    env: {
                        DOCKER_CONFIG: images.registry.dockerConfigFile
                    }
                });
            }
        });
    }
}
exports.Docker = Docker;
