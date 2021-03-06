import { Docker } from "./docker";
import * as core from "@actions/core";
import * as exec from "@actions/exec";

export class Action {

    private settings: ISettings;

    constructor(settings: ISettings) {
        this.settings = settings;
    }

    public async run() {
        let settings = this.settings;
        let docker = new Docker();

        let registry = await docker.login(
            settings.dockerUserName,
            settings.dockerPassword,
            settings.dockerRegistery
        );

        let context = docker.createBuildContext(
            registry,
            settings.dockerImageName,
            settings.dockerTags,
            settings.dockerSeedTags,
            settings.workingPath,
            settings.dockerFile
        );

        let images = await docker.build(
            context,
            []
        );

        await docker.publish(images);
    }
}

export interface ISettings {
    workingPath: string;
    dockerFile: string;
    dockerRegistery: string;
    dockerUserName: string;
    dockerPassword: string;
    dockerImageName: string;
    dockerTags: string[];
    dockerSeedTags: string[];
}

export function wait(milliseconds: number) {
    return new Promise((resolve) => {
        if (isNaN(milliseconds)) {
            throw new Error("milliseconds not a number");
        }

        setTimeout(() => resolve("done!"), milliseconds);
    });
}
