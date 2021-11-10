#!/bin/bash -ex

[[ "${1:-foo}" == "copr" ]] && source_build=1 || source_build=0
[[ ${OFFLINE_BUILD:-1} -eq 1 ]] && use_nodejs_modules=1 || use_nodejs_modules=0

if [[ $source_build -eq 0 && $use_nodejs_modules -eq 1 ]] ; then
  # Force updating nodejs-modules so any pre-seed update to rpm wait is minimized
  PACKAGER=$(command -v dnf >/dev/null 2>&1 && echo 'dnf' || echo 'yum')
  REPOS=$(sed -e '/^#/d' -e '/^[ \t]*$/d' automation/build.repos | cut -f 1 -d ',' | paste -s -d,)

  ${PACKAGER} --disablerepo='*' --enablerepo="${REPOS}" clean metadata
  ${PACKAGER} -y install ovirt-engine-nodejs-modules
fi

# Clean the artifacts directory:
test -d exported-artifacts && rm -rf exported-artifacts || :

# Create the artifacts directory:
mkdir -p exported-artifacts

# Resolve the version and snapshot used for RPM build:
version="$(jq -r '.version' package.json)"
date="$(date --utc +%Y%m%d)"
commit="$(git log -1 --pretty=format:%h)"
snapshot=".${date}git${commit}"

# Check if the commit is tagged (indicates a release build):
tag="$(git tag --points-at ${commit} | grep -v jenkins || true)"
if [ ! -z ${tag} ]; then
  snapshot=""
fi

# Build the tar file:
tar_name="ovirt-engine-ui-extensions"
tar_prefix="${tar_name}-${version}/"
tar_file="${tar_name}-${version}${snapshot}.tar.gz"
git archive --prefix="${tar_prefix}" --output="${tar_file}" HEAD

# Build the RPM:
mv "${tar_file}" packaging/
pushd packaging
    export source_build
    export tar_version="${version}"
    export tar_file
    export rpm_snapshot="${snapshot}"
    ./build.sh
popd

# Copy the .tar.gz and .rpm files to the artifacts directory:
for file in $(find . -type f -regex '.*\.\(tar.gz\|rpm\)'); do
  echo "Archiving file \"$file\"."
  mv "$file" exported-artifacts/
done
