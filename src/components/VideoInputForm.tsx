import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { FileVideo, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export default function VideoInputForm() {

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const promptRef = useRef<HTMLTextAreaElement>(null)

    const previewURL = useMemo(() => {
        if (!videoFile) return null
        return URL.createObjectURL(videoFile)
    }, [videoFile])

    async function convertVideoToAudio(video: File) {
        console.log('Convert started')

        const ffmpeg = await getFFmpeg()

        await ffmpeg.writeFile('input.mp4', await fetchFile(video))

        ffmpeg.on('progress', progress => {
            console.log('Convert progress: ' + Math.round(progress.progress * 100))
        })

        await ffmpeg.exec([
            '-i',
            'input.mp4',
            '-map',
            '0:a',
            '-b:a',
            '20k',
            '-acodec',
            'libmp3lame',
            'output.mp3'
        ])

        const data = await ffmpeg.readFile('output.mp3')

        const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
        const audioFile = new File([audioFileBlob], 'audio.mp3', { type: 'audio/mpeg' })

        console.log('Convert finished')

        return audioFile
    }

    function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
        //@ts-ignore
        const { files } = e.currentTarget

        if (files) setVideoFile(files[0])
    }

    async function handleUploadVideo(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        //@ts-ignore

        const prompt = promptRef.current?.value

        if (!videoFile) return

        const audioFile = await convertVideoToAudio(videoFile)
        console.log(prompt)
    }

    return (
        <form onSubmit={handleUploadVideo} className="space-y-6">
            <label htmlFor="video"
                className="relative border flex rounded aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
            >
                {previewURL ?
                    <video src={previewURL} controls={false} className="pointer-events-none absolute inset-0" />
                    : <>
                        <FileVideo />
                        Selecione um video
                    </>
                }
            </label>
            <input type="file" id="video" accept="video/mp4" className="sr-only" onChange={handleFileSelected} />

            <Separator />

            <div className="space-y-1">
                <Label htmlFor="transc-prompt">Prompt de transcrição</Label>
                <Textarea
                    ref={promptRef}
                    id="transc-prompt"
                    className="min-h-20"
                    placeholder="Inclua palavras-chave mencionadas no video separadas por vírgula"
                ></Textarea>
            </div>

            <Button type="submit" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Carregar vídeo
            </Button>

        </form>
    )
}