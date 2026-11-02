// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/alibaba/open-code-review/internal/console"
	"github.com/alibaba/open-code-review/internal/viewer"
	"github.com/spf13/cobra"
)

type webOptions struct {
	addr string
	open string
	repo string
}

var webOpts webOptions

var webCmd = &cobra.Command{
	Use:     "web",
	Aliases: []string{"ui", "console"},
	Short:   "Start the browser-based Web Console",
	Long: `Start the local Web Console for visual code review.

The console runs the same ocr commands the terminal uses: review, scan, session
history, rules, provider setup, and connection tests. It listens on loopback and
serves a Vue interface embedded in this binary.`,
	Args: cobra.NoArgs,
	Example: `  ocr web                         # start and open the browser
  ocr web --addr localhost:9000   # use another port
  ocr web --open=never            # print the URL only
  ocr web --repo ~/work/project   # point the console at a repository`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if err := viewer.ValidateOpenMode(webOpts.open); err != nil {
			return err
		}
		repoDir := webOpts.repo
		if repoDir == "" {
			wd, err := os.Getwd()
			if err != nil {
				return fmt.Errorf("get working directory: %w", err)
			}
			repoDir = wd
		}
		absRepo, err := filepath.Abs(repoDir)
		if err != nil {
			return fmt.Errorf("resolve repository path: %w", err)
		}
		return console.StartServer(console.Options{
			Addr:    webOpts.addr,
			Open:    webOpts.open,
			RepoDir: absRepo,
			Version: Version,
		})
	},
}

func init() {
	webCmd.Flags().StringVar(&webOpts.addr, "addr", "localhost:5484", "listen address")
	webCmd.Flags().StringVar(&webOpts.open, "open", viewer.OpenAuto,
		"when to open the browser: auto (only on a local terminal with a display), always, or never")
	webCmd.Flags().StringVar(&webOpts.repo, "repo", "", "root directory of the git repository (default: current dir)")
	webCmd.RegisterFlagCompletionFunc("open", completeEnum(viewer.OpenAuto, viewer.OpenAlways, viewer.OpenNever))
	rootCmd.AddCommand(webCmd)
}
