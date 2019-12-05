"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const command_1 = require("@actions/core/lib/command");
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
                        auth: new Buffer(`${username}:${password}`).toString("base64")
                    }
                }
            };
            const runnerTempDirectory = process.env.RUNNER_TEMP;
            const dirPath = path.join(runnerTempDirectory, `docker_login_${Date.now()}`);
            yield io.mkdirP(dirPath);
            const dockerConfigPath = path.join(dirPath, `config.json`);
            core.debug(`Writing docker config contents to ${dockerConfigPath}`);
            fs.writeFileSync(dockerConfigPath, JSON.stringify(config));
            command_1.issueCommand("set-env", { name: "DOCKER_CONFIG" }, dirPath);
            return {
                dockerConfigFile: dirPath,
                name: loginServer
            };
        });
    }
    createBuildContext(registry, name, tags, buildContext = ".", dockerFile = "Dockerfile") {
        let imageNames = [];
        for (let tag of tags) {
            let imageName = `${registry.name}/${name}:${tag}`;
            imageNames.push(imageName);
        }
        return {
            buildContext,
            dockerFile,
            imageNames,
            registry,
        };
    }
    build(context, options) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let imageName of context.imageNames) {
                yield exec.exec("docker", [
                    "build",
                    `--tag`,
                    imageName,
                    ...options,
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
