#!/usr/bin/env python3
"""
Script to compare data/pfp-ids.json with image files in public/ProfileIcon folder.
"""

import json
import os
import sys
from pathlib import Path
from typing import List, Set, Any

class PFPImageComparator:
    def __init__(self, pfp_ids_file: str = "data/pfp-ids.json", image_folder: str = "public/ProfileIcon"):
        self.pfp_ids_file = Path(pfp_ids_file)
        self.image_folder = Path(image_folder)
        
        # Check if files/folders exist
        if not self.pfp_ids_file.exists():
            print(f"Error: {self.pfp_ids_file} not found!", file=sys.stderr)
            print(f"Current directory: {Path.cwd()}", file=sys.stderr)
            sys.exit(1)
        
        if not self.image_folder.exists():
            print(f"Error: Image folder '{self.image_folder}' not found!", file=sys.stderr)
            print(f"Current directory: {Path.cwd()}", file=sys.stderr)
            sys.exit(1)
        
        if not self.image_folder.is_dir():
            print(f"Error: '{self.image_folder}' is not a directory!", file=sys.stderr)
            sys.exit(1)
    
    def load_ids_from_json(self) -> List[str]:
        """Load IDs from data/pfp-ids.json file."""
        print(f"Loading IDs from: {self.pfp_ids_file}")
        
        try:
            with open(self.pfp_ids_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            ids = self.extract_ids(data)
            print(f"Found {len(ids)} IDs in JSON file")
            return ids
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}", file=sys.stderr)
            sys.exit(1)
        except IOError as e:
            print(f"Error reading file: {e}", file=sys.stderr)
            sys.exit(1)
    
    def extract_ids(self, data: Any) -> List[str]:
        """Extract IDs from various possible JSON structures."""
        ids = []
        
        if isinstance(data, list):
            for item in data:
                if isinstance(item, str):
                    ids.append(item)
                elif isinstance(item, dict):
                    # Try common keys for IDs
                    for key in ['id', 'ID', 'Id', 'name', 'filename', 'file', 'pfp_id']:
                        if key in item:
                            ids.append(str(item[key]))
                            break
                    else:
                        # If no ID key found, try to convert the entire item
                        ids.append(json.dumps(item))
        
        elif isinstance(data, dict):
            # Check for common keys that might contain the ID list
            if 'ids' in data:
                return self.extract_ids(data['ids'])
            elif 'data' in data:
                return self.extract_ids(data['data'])
            elif 'pfp_ids' in data or 'pfpIds' in data:
                key = 'pfp_ids' if 'pfp_ids' in data else 'pfpIds'
                return self.extract_ids(data[key])
            else:
                # If dictionary keys are the IDs
                ids = list(data.keys())
                # Or if values contain IDs
                if not ids or all(isinstance(v, (dict, list)) for v in data.values()):
                    for value in data.values():
                        ids.extend(self.extract_ids(value))
        
        return ids
    
    def get_image_ids_from_folder(self) -> Set[str]:
        """Get all image file IDs from the public/ProfileIcon folder."""
        print(f"Scanning image folder: {self.image_folder}")
        
        image_extensions = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg'}
        image_ids = set()
        image_files = []
        
        try:
            for file in self.image_folder.iterdir():
                if file.is_file() and file.suffix.lower() in image_extensions:
                    # Remove extension to get the ID
                    image_id = file.stem
                    image_ids.add(image_id)
                    image_files.append(file.name)
                    
        except IOError as e:
            print(f"Error reading folder: {e}", file=sys.stderr)
            sys.exit(1)
        
        print(f"Found {len(image_ids)} image files in {self.image_folder}")
        return image_ids
    
    def compare_ids(self) -> dict:
        """Compare IDs from JSON with image files in folder."""
        json_ids = self.load_ids_from_json()
        image_ids = self.get_image_ids_from_folder()
        
        # Convert JSON IDs to set for comparison
        json_ids_set = set(json_ids)
        
        # Find missing images (in JSON but not in folder)
        missing_images = json_ids_set - image_ids
        # Find extra images (in folder but not in JSON)
        extra_images = image_ids - json_ids_set
        # Find matching images
        matching_images = json_ids_set & image_ids
        # Find duplicates in JSON
        duplicates_in_json = [id for id in json_ids if json_ids.count(id) > 1]
        
        return {
            'json_ids': json_ids,
            'json_ids_set': json_ids_set,
            'image_ids': image_ids,
            'missing_images': missing_images,
            'extra_images': extra_images,
            'matching_images': matching_images,
            'duplicates_in_json': list(set(duplicates_in_json))
        }
    
    def display_results(self, results: dict):
        """Display comparison results."""
        json_count = len(results['json_ids_set'])
        image_count = len(results['image_ids'])
        missing_count = len(results['missing_images'])
        extra_count = len(results['extra_images'])
        matching_count = len(results['matching_images'])
        duplicate_count = len(results['duplicates_in_json'])
        
        print("\n" + "="*60)
        print("COMPARISON RESULTS")
        print("="*60)
        print(f"JSON file:           {self.pfp_ids_file}")
        print(f"Image folder:        {self.image_folder}")
        print("-"*60)
        print(f"IDs in JSON:          {len(results['json_ids'])} (unique: {json_count})")
        print(f"Images in folder:     {image_count}")
        print(f"Matching:             {matching_count}")
        print(f"Missing images:       {missing_count}")
        print(f"Extra images:         {extra_count}")
        if duplicate_count > 0:
            print(f"Duplicates in JSON:   {duplicate_count}")
        print("="*60)
        
        # Display missing images
        if results['missing_images']:
            print(f"\n❌ MISSING IMAGES ({missing_count}):")
            print("-"*60)
            for i, image_id in enumerate(sorted(results['missing_images']), 1):
                print(f"{i:4d}. {image_id}")
        else:
            print("\n✓ No missing images! All IDs have corresponding image files.")
        
        # Display extra images
        if results['extra_images']:
            print(f"\n➕ EXTRA IMAGES (not in JSON) ({extra_count}):")
            print("-"*60)
            for i, image_id in enumerate(sorted(results['extra_images']), 1):
                print(f"{i:4d}. {image_id}")
        
        # Display duplicates if any
        if results['duplicates_in_json']:
            print(f"\n⚠️  DUPLICATE IDs IN JSON ({duplicate_count}):")
            print("-"*60)
            for image_id in results['duplicates_in_json']:
                count = results['json_ids'].count(image_id)
                print(f"  {image_id} (appears {count} times)")
    
    def save_results(self, results: dict, output_file: str = "comparison_results.txt"):
        """Save comparison results to a file."""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("="*60 + "\n")
            f.write("PFP IMAGE COMPARISON RESULTS\n")
            f.write("="*60 + "\n")
            f.write(f"JSON file: {self.pfp_ids_file}\n")
            f.write(f"Image folder: {self.image_folder}\n")
            f.write(f"Date: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("="*60 + "\n\n")
            
            f.write(f"Summary:\n")
            f.write(f"  IDs in JSON: {len(results['json_ids_set'])}\n")
            f.write(f"  Images in folder: {len(results['image_ids'])}\n")
            f.write(f"  Matching: {len(results['matching_images'])}\n")
            f.write(f"  Missing images: {len(results['missing_images'])}\n")
            f.write(f"  Extra images: {len(results['extra_images'])}\n\n")
            
            # Write missing images
            f.write("MISSING IMAGES (in JSON but not in folder):\n")
            f.write("-"*60 + "\n")
            if results['missing_images']:
                for image_id in sorted(results['missing_images']):
                    f.write(f"{image_id}\n")
            else:
                f.write("None\n")
            
            # Write extra images
            f.write("\nEXTRA IMAGES (in folder but not in JSON):\n")
            f.write("-"*60 + "\n")
            if results['extra_images']:
                for image_id in sorted(results['extra_images']):
                    f.write(f"{image_id}\n")
            else:
                f.write("None\n")
        
        print(f"\nResults saved to: {output_file}")
    
    def save_missing_ids(self, results: dict, output_file: str = "missing_ids.json"):
        """Save missing IDs to a JSON file for easy use with download script."""
        missing_ids = sorted(list(results['missing_images']))
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(missing_ids, f, indent=2, ensure_ascii=False)
        
        print(f"Missing IDs saved to: {output_file} (JSON format)")
    
    def run(self, save_results: bool = True, save_missing: bool = True):
        """Main execution method."""
        print("="*60)
        print("PFP Image Comparator")
        print("="*60)
        print(f"JSON file: {self.pfp_ids_file}")
        print(f"Image folder: {self.image_folder}")
        
        # Compare IDs
        results = self.compare_ids()
        
        # Display results
        self.display_results(results)
        
        # Save results
        if save_results:
            self.save_results(results)
        
        # Save missing IDs
        if save_missing and results['missing_images']:
            self.save_missing_ids(results)
        
        return results

def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Compare data/pfp-ids.json with image files in public/ProfileIcon folder"
    )
    parser.add_argument(
        "--ids-file", "-f",
        default="data/pfp-ids.json",
        help="Path to pfp-ids.json file (default: data/pfp-ids.json)"
    )
    parser.add_argument(
        "--image-folder", "-i",
        default="public/ProfileIcon",
        help="Path to image folder (default: public/ProfileIcon)"
    )
    parser.add_argument(
        "--no-save",
        action="store_true",
        help="Don't save results to files"
    )
    parser.add_argument(
        "--output", "-o",
        default="comparison_results.txt",
        help="Output file for comparison results (default: comparison_results.txt)"
    )
    
    args = parser.parse_args()
    
    comparator = PFPImageComparator(
        pfp_ids_file=args.ids_file,
        image_folder=args.image_folder
    )
    
    comparator.run(
        save_results=not args.no_save,
        save_missing=not args.no_save
    )

if __name__ == "__main__":
    main()