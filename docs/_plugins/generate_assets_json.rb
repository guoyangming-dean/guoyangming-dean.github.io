# Jekyll plugin to auto-generate assets/assets.json before build
# This runs automatically when Jekyll builds the site (including on GitHub Pages)

require 'json'

Jekyll::Hooks.register :site, :pre_build do |site|
  pictures_dir = File.join(site.source, 'assets', 'pictures')
  files_dir = File.join(site.source, 'assets', 'files')
  output_path = File.join(site.source, 'assets', 'assets.json')

  def list_files(dir)
    return [] unless Dir.exist?(dir)
    Dir.entries(dir)
      .reject { |f| f.start_with?('.') || File.directory?(File.join(dir, f)) }
      .sort
  end

  assets = {
    'pictures' => list_files(pictures_dir),
    'files' => list_files(files_dir)
  }

  File.write(output_path, JSON.generate(assets))
  puts "[assets] Generated #{output_path} (#{assets['pictures'].length} pictures, #{assets['files'].length} files)"
end
