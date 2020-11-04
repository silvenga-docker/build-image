import * as core from "@actions/core";
import * as io from "@actions/io";
import { issueCommand } from "@actions/core/lib/file-command";
import * as path from "path";
import * as fs from "fs";
import * as exec from "@actions/exec";

export class Docker {
    public async login(username: string, password: string, loginServer: string): Promise<IRegistry> {

        // https://github.com/Azure/docker-login/blob/master/src/login.ts

        let config = {
            auths: {
                [`https://${loginServer}`]: {
                    auth: Buffer.from(`${username}:${password}`).toString("base64")
                }
            }
        };

        const runnerTempDirectory = process.env.RUNNER_TEMP as string;
        const dirPath = path.join(runnerTempDirectory, `docker_login_${Date.now()}`);
        await io.mkdirP(dirPath);
        const dockerConfigPath = path.join(dirPath, `config.json`);
        core.debug(`Writing docker config contents to ${dockerConfigPath}`);
        fs.writeFileSync(dockerConfigPath, JSON.stringify(config));
        issueCommand("ENV", `DOCKER_CONFIG=${dirPath}`);
        process.env.DOCKER_CONFIG = dirPath;

        return {
            dockerConfigFile: dirPath,
            name: loginServer
        };
    }

    public createBuildContext(registry: IRegistry, name: string, tags: string[], dockerSeedTags: string[], buildContext: string = ".", dockerFile: string = "Dockerfile"): IBuildContext {
        let imageNames: string[] = [];
        for (let tag of tags) {
            let imageName = `${registry.name}/${name}:${tag}`;
            imageNames.push(imageName);
        }
        let seedImageNames: string[] = [];
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

    public async build(context: IBuildContext, options: string[]): Promise<IImages> {

        let cacheFrom = context.seedImageNames
            .reduce<string[]>((current, next) => {
                current.push("--cache-from", next);
                return current;
            }, []);

        for (let imageName of context.imageNames) {
            await exec.exec("docker", [
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
    }

    public async publish(images: IImages, options: string[] = []) {
        for (let image of images.imageNames) {
            await exec.exec(
                "docker",
                [
                    "push",
                    image,
                    ...options
                ],
                {
                    env: {
                        DOCKER_CONFIG: images.registry.dockerConfigFile
                    }
                }
            );
        }
    }
}

export interface IRegistry {
    dockerConfigFile: string;
    name: string;
}

export interface IBuildContext {
    registry: IRegistry;
    imageNames: string[];
    seedImageNames: string[];
    buildContext: string;
    dockerFile: string;
}

export interface IImages {
    registry: IRegistry;
    imageNames: string[];
}
